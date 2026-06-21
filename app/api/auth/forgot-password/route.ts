import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbRun } from '@/lib/database';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });

    const user = await dbGet<{ id: number; email: string }>('SELECT id, email FROM users WHERE email = ?', email.toLowerCase().trim());

    // Always return success to prevent email enumeration
    if (!user) return NextResponse.json({ success: true });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour

    await dbRun('DELETE FROM password_resets WHERE user_id = ?', user.id);
    await dbRun('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)', user.id, token, expiresAt);

    const appUrl = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.simple-g.com').replace(/\/$/, '');
    const resetUrl = `${appUrl}/reset-password/${token}`;

    await sendPasswordResetEmail(user.email, resetUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
