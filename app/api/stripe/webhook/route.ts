import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { getDb } from '@/lib/database';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const db = getDb();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.metadata?.userId) {
          const subscriptionId = session.subscription as string;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          db.prepare(`
            UPDATE users SET
              stripe_subscription_id = ?,
              subscription_status = ?
            WHERE id = ?
          `).run(subscriptionId, subscription.status, Number(session.metadata.userId));
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          db.prepare(`
            UPDATE users SET subscription_status = ? WHERE id = ?
          `).run(subscription.status, Number(userId));
        } else {
          // Fallback: look up by stripe_subscription_id
          db.prepare(`
            UPDATE users SET subscription_status = ? WHERE stripe_subscription_id = ?
          `).run(subscription.status, subscription.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          db.prepare(`
            UPDATE users SET subscription_status = 'canceled', stripe_subscription_id = NULL WHERE id = ?
          `).run(Number(userId));
        } else {
          db.prepare(`
            UPDATE users SET subscription_status = 'canceled', stripe_subscription_id = NULL
            WHERE stripe_subscription_id = ?
          `).run(subscription.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          db.prepare(`
            UPDATE users SET subscription_status = 'past_due' WHERE stripe_subscription_id = ?
          `).run(invoice.subscription as string);
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
  }
}
