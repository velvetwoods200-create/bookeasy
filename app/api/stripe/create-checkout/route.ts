import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbGet, dbRun, DbUser } from '@/lib/database';
import { stripe, createCheckoutSession, createStripeCustomer } from '@/lib/stripe';

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await dbGet<DbUser>('SELECT * FROM users WHERE id = ?', Number(session.user.id));

    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    let stripeCustomerId = user.stripe_customer_id;

    if (stripeCustomerId) {
      // Verify the customer still exists in Stripe (may be from a different mode)
      try {
        await stripe.customers.retrieve(stripeCustomerId);
      } catch {
        // Customer doesn't exist in this Stripe mode — create a fresh one
        stripeCustomerId = null;
      }
    }

    if (!stripeCustomerId) {
      stripeCustomerId = await createStripeCustomer(user.name, user.email);
      await dbRun('UPDATE users SET stripe_customer_id = ? WHERE id = ?', stripeCustomerId, user.id);
    }

    const appUrl = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.simple-g.com').replace(/\/$/, '');
    const checkoutUrl = await createCheckoutSession(stripeCustomerId, user.id, appUrl);

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Create checkout error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
