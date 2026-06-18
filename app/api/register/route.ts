import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/database';
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

    const db = getDb();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Set trial end to 14 days from now
    const trialEnd = Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60;

    // Create Stripe customer
    let stripeCustomerId: string | null = null;
    try {
      stripeCustomerId = await createStripeCustomer(name, email.toLowerCase());
    } catch {
      // Non-fatal: user can still be created without Stripe
    }

    const result = db.prepare(`
      INSERT INTO users (name, email, password, business_name, stripe_customer_id, subscription_status, trial_end)
      VALUES (?, ?, ?, ?, ?, 'trialing', ?)
    `).run(name, email.toLowerCase(), hashedPassword, businessName || name, stripeCustomerId, trialEnd);

    const userId = result.lastInsertRowid as number;

    // Insert default working hours (Mon–Fri, 9am–5pm)
    const insertHours = db.prepare(`
      INSERT OR IGNORE INTO working_hours (user_id, day_of_week, start_time, end_time, is_active)
      VALUES (?, ?, '09:00', '17:00', ?)
    `);
    for (let day = 0; day <= 6; day++) {
      insertHours.run(userId, day, day >= 1 && day <= 5 ? 1 : 0);
    }

    return NextResponse.json({ message: 'Account created successfully.' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 });
  }
}
