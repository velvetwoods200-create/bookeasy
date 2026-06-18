import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/database';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const hours = db
      .prepare('SELECT * FROM working_hours WHERE user_id = ? ORDER BY day_of_week ASC')
      .all(Number(session.user.id));

    return NextResponse.json({ hours });
  } catch (error) {
    console.error('Get working hours error:', error);
    return NextResponse.json({ error: 'Failed to fetch working hours.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { hours } = body;

    if (!Array.isArray(hours) || hours.length !== 7) {
      return NextResponse.json({ error: 'Must provide hours for all 7 days.' }, { status: 400 });
    }

    const db = getDb();
    const upsert = db.prepare(`
      INSERT INTO working_hours (user_id, day_of_week, start_time, end_time, is_active)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id, day_of_week) DO UPDATE SET
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        is_active = excluded.is_active
    `);

    db.exec('BEGIN');
    try {
      for (const h of hours) {
        upsert.run(
          Number(session.user.id),
          Number(h.day_of_week),
          h.start_time,
          h.end_time,
          h.is_active ? 1 : 0
        );
      }
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }

    const updated = db
      .prepare('SELECT * FROM working_hours WHERE user_id = ? ORDER BY day_of_week ASC')
      .all(Number(session.user.id));

    return NextResponse.json({ hours: updated });
  } catch (error) {
    console.error('Update working hours error:', error);
    return NextResponse.json({ error: 'Failed to update working hours.' }, { status: 500 });
  }
}
