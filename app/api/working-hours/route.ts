import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbAll, dbRun } from '@/lib/database';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const hours = await dbAll(
      'SELECT * FROM working_hours WHERE user_id = ? ORDER BY day_of_week ASC',
      Number(session.user.id)
    );

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

    for (const h of hours) {
      await dbRun(
        `INSERT INTO working_hours (user_id, day_of_week, start_time, end_time, is_active)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(user_id, day_of_week) DO UPDATE SET
           start_time = EXCLUDED.start_time,
           end_time = EXCLUDED.end_time,
           is_active = EXCLUDED.is_active`,
        Number(session.user.id), Number(h.day_of_week), h.start_time, h.end_time, h.is_active ? 1 : 0
      );
    }

    const updated = await dbAll(
      'SELECT * FROM working_hours WHERE user_id = ? ORDER BY day_of_week ASC',
      Number(session.user.id)
    );

    return NextResponse.json({ hours: updated });
  } catch (error) {
    console.error('Update working hours error:', error);
    return NextResponse.json({ error: 'Failed to update working hours.' }, { status: 500 });
  }
}
