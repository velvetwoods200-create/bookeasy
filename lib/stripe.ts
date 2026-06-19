import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function createStripeCustomer(name: string, email: string): Promise<string> {
  const customer = await stripe.customers.create({ name, email });
  return customer.id;
}

export async function createCheckoutSession(
  customerId: string,
  userId: number,
  returnUrl: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${returnUrl}/dashboard?subscription=success`,
    cancel_url: `${returnUrl}/dashboard?subscription=cancelled`,
    metadata: { userId: String(userId) },
    subscription_data: {
      metadata: { userId: String(userId) },
    },
  });

  return session.url!;
}

export async function createPortalSession(customerId: string, returnUrl: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${returnUrl}/dashboard`,
  });
  return session.url;
}

export function isSubscriptionActive(
  status: string,
  trialEnd: number | null
): boolean {
  if (status === 'active') return true;
  if (status === 'trialing') {
    if (!trialEnd) return true;
    return Date.now() / 1000 < trialEnd;
  }
  return false;
}
