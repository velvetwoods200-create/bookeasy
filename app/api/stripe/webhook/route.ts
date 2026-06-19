import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { dbRun } from '@/lib/database';

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

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.metadata?.userId) {
          const subscriptionId = session.subscription as string;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await dbRun(
            `UPDATE users SET stripe_subscription_id = ?, subscription_status = ? WHERE id = ?`,
            subscriptionId, subscription.status, Number(session.metadata.userId)
          );
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (userId) {
          await dbRun(
            `UPDATE users SET subscription_status = ? WHERE id = ?`,
            subscription.status, Number(userId)
          );
        } else {
          await dbRun(
            `UPDATE users SET subscription_status = ? WHERE stripe_subscription_id = ?`,
            subscription.status, subscription.id
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (userId) {
          await dbRun(
            `UPDATE users SET subscription_status = 'canceled', stripe_subscription_id = NULL WHERE id = ?`,
            Number(userId)
          );
        } else {
          await dbRun(
            `UPDATE users SET subscription_status = 'canceled', stripe_subscription_id = NULL WHERE stripe_subscription_id = ?`,
            subscription.id
          );
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await dbRun(
            `UPDATE users SET subscription_status = 'past_due' WHERE stripe_subscription_id = ?`,
            invoice.subscription as string
          );
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
