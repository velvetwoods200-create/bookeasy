'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function BillingPage() {
  const { data: session } = useSession();
  const [portalLoading, setPortalLoading] = useState(false);
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const subStatus = session?.user?.subscriptionStatus;
  const trialEnd = session?.user?.trialEnd ? Number(session.user.trialEnd) : null;
  const now = Math.floor(Date.now() / 1000);

  const isActive = subStatus === 'active';
  const isTrialing = subStatus === 'trialing' && trialEnd !== null && now < trialEnd;
  const trialDaysLeft = isTrialing && trialEnd ? Math.max(0, Math.ceil((trialEnd - now) / 86400)) : 0;
  const trialEndDate = trialEnd ? new Date(trialEnd * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null;

  const statusLabel = isActive ? 'Active' : isTrialing ? 'Free Trial' : 'Inactive';
  const statusColor = isActive ? 'text-green-600 bg-green-50 border-green-200' : isTrialing ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-red-600 bg-red-50 border-red-200';

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setBanner({ type: 'error', text: data.error || 'Could not open billing portal.' });
      }
    } catch {
      setBanner({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleSubscribe() {
    setSubscribeLoading(true);
    try {
      const res = await fetch('/api/stripe/create-checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setBanner({ type: 'error', text: data.error || 'Could not start checkout.' });
      }
    } catch {
      setBanner({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setSubscribeLoading(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500 mt-1">Manage your subscription and billing details.</p>
      </div>

      {banner && (
        <div className={`mb-6 border px-4 py-3 rounded-lg flex items-center justify-between ${banner.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
          <span className="text-sm font-medium">{banner.text}</span>
          <button onClick={() => setBanner(null)} className="ml-4 opacity-60 hover:opacity-100">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Current plan */}
      <Card className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Current plan</h2>
            <p className="text-sm text-gray-500 mt-0.5">Simple-G Pro — $9/month</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColor}`}>
            {statusLabel}
          </span>
        </div>

        {isTrialing && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-amber-800">
              Free trial — {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} remaining
            </p>
            {trialEndDate && (
              <p className="text-xs text-amber-700 mt-1">
                Your trial ends on {trialEndDate}. Subscribe before then to keep your booking page active.
              </p>
            )}
          </div>
        )}

        {isActive && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-green-800">Your subscription is active</p>
            <p className="text-xs text-green-700 mt-1">Your booking page is live and accepting appointments.</p>
          </div>
        )}

        {!isActive && !isTrialing && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-red-800">No active subscription</p>
            <p className="text-xs text-red-700 mt-1">Your booking page is paused. Subscribe to reactivate it.</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {isActive && (
            <Button onClick={handleManageBilling} loading={portalLoading} variant="secondary">
              Manage billing & invoices
            </Button>
          )}
          {!isActive && (
            <Button onClick={handleSubscribe} loading={subscribeLoading}>
              Subscribe now — $9/mo
            </Button>
          )}
          {isTrialing && (
            <Button onClick={handleSubscribe} loading={subscribeLoading}>
              Subscribe early — $9/mo
            </Button>
          )}
        </div>
      </Card>

      {/* What's included */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">What&apos;s included</h2>
        <ul className="space-y-2">
          {[
            'Unlimited bookings',
            'Your own booking page URL',
            'Email confirmations & cancellations',
            'Unlimited services',
            'Working hours control',
            'Booking management dashboard',
            'Cancel anytime',
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </Card>

      {/* Go live instructions */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Ready to go live?</h2>
        <p className="text-sm text-gray-500 mb-5">Follow these steps to switch from test mode to live payments.</p>

        <ol className="space-y-5">
          {[
            {
              step: '1',
              title: 'Activate your Stripe account',
              desc: 'Go to stripe.com, complete your business and bank account details to enable live payouts.',
            },
            {
              step: '2',
              title: 'Get your live Stripe keys',
              desc: 'In the Stripe dashboard, switch to "Live mode" (toggle top-left). Go to Developers → API keys and copy your live Secret key and Publishable key.',
            },
            {
              step: '3',
              title: 'Create a live price',
              desc: 'In Stripe → Products, create a product called "Simple-G Pro" priced at $9/month (recurring). Copy the live Price ID (starts with price_).',
            },
            {
              step: '4',
              title: 'Update Vercel environment variables',
              desc: 'Go to vercel.com → your project → Settings → Environment Variables. Update STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, and STRIPE_PRICE_ID with your live values.',
            },
            {
              step: '5',
              title: 'Update the webhook',
              desc: 'In Stripe → Developers → Webhooks, add a new endpoint for https://www.simple-g.com/api/stripe/webhook in live mode. Copy the signing secret and update STRIPE_WEBHOOK_SECRET in Vercel.',
            },
            {
              step: '6',
              title: 'Redeploy',
              desc: 'In Vercel → Deployments, click the three dots on the latest deployment and select Redeploy to pick up the new environment variables.',
            },
          ].map(({ step, title, desc }) => (
            <li key={step} className="flex gap-4">
              <div className="w-7 h-7 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {step}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{title}</p>
                <p className="text-gray-500 text-sm mt-0.5">{desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-indigo-800 mb-1">Test card (for testing only)</p>
          <p className="text-xs text-indigo-700 font-mono">4242 4242 4242 4242 · Any future date · Any CVC</p>
        </div>
      </Card>
    </div>
  );
}
