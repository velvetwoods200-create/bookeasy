'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface LandingCTAProps {
  variant?: 'hero' | 'pricing' | 'bottom';
}

export default function LandingCTA({ variant = 'hero' }: LandingCTAProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const loading = status === 'loading';

  async function handleUpgrade() {
    try {
      const res = await fetch('/api/stripe/create-checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Could not start checkout. Please try again.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    }
  }

  if (loading) {
    if (variant === 'hero') {
      return (
        <div className="h-14 w-48 bg-white/20 rounded-xl animate-pulse" />
      );
    }
    return <div className="h-14 w-full bg-white/20 rounded-xl animate-pulse" />;
  }

  // NOT logged in
  if (!session) {
    if (variant === 'hero') {
      return (
        <Link
          href="/register"
          className="inline-flex items-center justify-center bg-white text-indigo-700 font-semibold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl text-lg"
        >
          Start free trial
          <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      );
    }
    if (variant === 'pricing') {
      return (
        <Link
          href="/register"
          className="block w-full bg-white text-indigo-700 font-semibold py-4 rounded-xl hover:bg-indigo-50 transition-colors text-center text-lg"
        >
          Start free trial
        </Link>
      );
    }
    return (
      <Link
        href="/register"
        className="inline-flex items-center bg-indigo-600 text-white font-semibold px-10 py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl text-lg"
      >
        Get started free — no credit card needed
        <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    );
  }

  const status2 = session.user.subscriptionStatus;
  const trialEnd = session.user.trialEnd ? Number(session.user.trialEnd) : null;
  const now = Math.floor(Date.now() / 1000);
  const daysLeft = trialEnd ? Math.ceil((trialEnd - now) / 86400) : 0;

  const isActive = status2 === 'active';
  const isTrialExpiringSoon = status2 === 'trialing' && daysLeft <= 7 && daysLeft > 0;
  const isExpiredOrInactive = status2 === 'canceled' || status2 === 'past_due' ||
    (status2 === 'trialing' && daysLeft <= 0);

  // Active subscription
  if (isActive) {
    if (variant === 'hero') {
      return (
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center bg-white text-indigo-700 font-semibold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl text-lg"
        >
          Go to Dashboard
          <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      );
    }
    if (variant === 'pricing') {
      return (
        <Link
          href="/dashboard"
          className="block w-full bg-white text-indigo-700 font-semibold py-4 rounded-xl hover:bg-indigo-50 transition-colors text-center text-lg"
        >
          Go to Dashboard
        </Link>
      );
    }
    return (
      <Link
        href="/dashboard"
        className="inline-flex items-center bg-indigo-600 text-white font-semibold px-10 py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl text-lg"
      >
        Go to Dashboard
        <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    );
  }

  // Trial expiring soon (≤7 days)
  if (isTrialExpiringSoon) {
    if (variant === 'pricing') {
      return (
        <button
          onClick={handleUpgrade}
          className="block w-full bg-orange-500 text-white font-semibold py-4 rounded-xl hover:bg-orange-600 transition-colors text-center text-lg"
        >
          Upgrade Now — {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
        </button>
      );
    }
    return (
      <button
        onClick={handleUpgrade}
        className="inline-flex items-center justify-center bg-orange-500 text-white font-semibold px-8 py-4 rounded-xl hover:bg-orange-600 transition-all shadow-lg text-lg"
      >
        Upgrade Now — {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
        <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
    );
  }

  // Expired or inactive
  if (isExpiredOrInactive) {
    if (variant === 'pricing') {
      return (
        <button
          onClick={handleUpgrade}
          className="block w-full bg-red-600 text-white font-semibold py-4 rounded-xl hover:bg-red-700 transition-colors text-center text-lg"
        >
          Reactivate — $9/month
        </button>
      );
    }
    return (
      <button
        onClick={handleUpgrade}
        className="inline-flex items-center justify-center bg-red-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-red-700 transition-all shadow-lg text-lg"
      >
        Reactivate — $9/month
        <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
    );
  }

  // Trialing with >7 days left → offer to subscribe early
  if (variant === 'pricing') {
    return (
      <button
        onClick={handleUpgrade}
        className="block w-full bg-white text-indigo-700 font-semibold py-4 rounded-xl hover:bg-indigo-50 transition-colors text-center text-lg"
      >
        Subscribe now — $9/mo
      </button>
    );
  }
  return (
    <button
      onClick={handleUpgrade}
      className="inline-flex items-center justify-center bg-white text-indigo-700 font-semibold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl text-lg"
    >
      Subscribe now — $9/mo
      <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </button>
  );
}
