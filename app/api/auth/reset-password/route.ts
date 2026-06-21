import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbRun } from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);
    const reset = await dbGet<{ id: number; user_id: number; expires_at: number }>(
      'SELECT id, user_id, expires_at FROM password_resets WHERE token = ?',
      token
    );

    if (!reset || reset.expires_at < now) {
      return NextResponse.json({ error: 'This reset link is invalid or has expired.' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    await dbRun('UPDATE users SET password = ? WHERE id = ?', hashed, reset.user_id);
    await dbRun('DELETE FROM password_resets WHERE id = ?', reset.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
