import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb, DbUser } from '@/lib/database';
import { createCheckoutSession, createStripeCustomer } from '@/lib/stripe';

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const user = db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(Number(session.user.id)) as DbUser | undefined;

    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    let stripeCustomerId = user.stripe_customer_id;

    // Create Stripe customer if they don't have one yet
    if (!stripeCustomerId) {
      stripeCustomerId = await createStripeCustomer(user.name, user.email);
      db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?').run(
        stripeCustomerId,
        user.id
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const checkoutUrl = await createCheckoutSession(stripeCustomerId, user.id, appUrl);

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Create checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 });
  }
}
