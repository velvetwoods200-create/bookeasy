import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/database';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const services = db
      .prepare('SELECT * FROM services WHERE user_id = ? ORDER BY created_at ASC')
      .all(Number(session.user.id));

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Get services error:', error);
    return NextResponse.json({ error: 'Failed to fetch services.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, duration, price } = body;

    if (!name || !duration) {
      return NextResponse.json({ error: 'Service name and duration are required.' }, { status: 400 });
    }

    if (Number(duration) < 5 || Number(duration) > 480) {
      return NextResponse.json({ error: 'Duration must be between 5 and 480 minutes.' }, { status: 400 });
    }

    if (Number(price) < 0) {
      return NextResponse.json({ error: 'Price cannot be negative.' }, { status: 400 });
    }

    const db = getDb();
    const result = db
      .prepare('INSERT INTO services (user_id, name, duration, price) VALUES (?, ?, ?, ?)')
      .run(Number(session.user.id), name.trim(), Number(duration), Number(price) || 0);

    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error('Create service error:', error);
    return NextResponse.json({ error: 'Failed to create service.' }, { status: 500 });
  }
}
