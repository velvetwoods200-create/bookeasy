import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbGet, dbRun } from '@/lib/database';
import { createStripeCustomer } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, businessName } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const existing = await dbGet<{ id: number }>('SELECT id FROM users WHERE email = ?', email.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const trialEnd = Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60;

    let stripeCustomerId: string | null = null;
    try {
      stripeCustomerId = await createStripeCustomer(name, email.toLowerCase());
    } catch {
      // Non-fatal
    }

    const row = await dbGet<{ id: number }>(`
      INSERT INTO users (name, email, password, business_name, stripe_customer_id, subscription_status, trial_end)
      VALUES (?, ?, ?, ?, ?, 'trialing', ?) RETURNING id
    `, name, email.toLowerCase(), hashedPassword, businessName || name, stripeCustomerId, trialEnd);

    const userId = row!.id;

    for (let day = 0; day <= 6; day++) {
      await dbRun(
        `INSERT INTO working_hours (user_id, day_of_week, start_time, end_time, is_active)
         VALUES (?, ?, '09:00', '17:00', ?) ON CONFLICT (user_id, day_of_week) DO NOTHING`,
        userId, day, day >= 1 && day <= 5 ? 1 : 0
      );
    }

    return NextResponse.json({ message: 'Account created successfully.' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 });
  }
}
