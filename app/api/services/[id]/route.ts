import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbGet, dbRun } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, duration, price } = body;

    if (!name || !duration) {
      return NextResponse.json({ error: 'Service name and duration are required.' }, { status: 400 });
    }

    const existing = await dbGet(
      'SELECT id FROM services WHERE id = ? AND user_id = ?',
      Number(params.id), Number(session.user.id)
    );

    if (!existing) {
      return NextResponse.json({ error: 'Service not found.' }, { status: 404 });
    }

    const service = await dbGet(
      'UPDATE services SET name = ?, duration = ?, price = ? WHERE id = ? RETURNING *',
      name.trim(), Number(duration), Number(price) || 0, Number(params.id)
    );

    return NextResponse.json({ service });
  } catch (error) {
    console.error('Update service error:', error);
    return NextResponse.json({ error: 'Failed to update service.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await dbGet(
      'SELECT id FROM services WHERE id = ? AND user_id = ?',
      Number(params.id), Number(session.user.id)
    );

    if (!existing) {
      return NextResponse.json({ error: 'Service not found.' }, { status: 404 });
    }

    await dbRun('DELETE FROM services WHERE id = ?', Number(params.id));
    return NextResponse.json({ message: 'Service deleted.' });
  } catch (error) {
    console.error('Delete service error:', error);
    return NextResponse.json({ error: 'Failed to delete service.' }, { status: 500 });
  }
}
