'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Modal from '@/components/Modal';

interface Booking {
  id: number;
  service_name: string;
  service_duration: number;
  service_price: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: number;
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

function isUpcoming(booking: Booking): boolean {
  const now = new Date();
  const [y, m, d] = booking.date.split('-').map(Number);
  const bookingDate = new Date(y, m - 1, d);
  bookingDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return bookingDate >= today && booking.status === 'confirmed';
}

function DashboardContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (searchParams.get('subscription') === 'success') {
      setSuccessBanner('Subscription activated! Your booking page is now live.');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!cancelModal) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${cancelModal.id}/cancel`, { method: 'POST' });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === cancelModal.id ? { ...b, status: 'cancelled' } : b))
        );
        setCancelModal(null);
      }
    } finally {
      setCancelling(false);
    }
  }

  const upcomingBookings = bookings.filter(isUpcoming);
  const pastBookings = bookings.filter((b) => !isUpcoming(b));
  const displayBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const isActive =
    session?.user?.subscriptionStatus === 'active' ||
    (session?.user?.subscriptionStatus === 'trialing' &&
      session?.user?.trialEnd &&
      Date.now() / 1000 < session.user.trialEnd);

  const trialDaysLeft = session?.user?.trialEnd
    ? Math.max(0, Math.ceil((session.user.trialEnd - Date.now() / 1000) / 86400))
    : null;

  async function handleSubscribe() {
    const res = await fetch('/api/stripe/create-checkout', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  async function handleManageBilling() {
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Success banner */}
      {successBanner && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium">{successBanner}</span>
          <button onClick={() => setSuccessBanner('')} className="text-green-500 hover:text-green-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.businessName || session?.user?.name} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here are your appointments.</p>
      </div>

      {/* Subscription alert */}
      {session?.user?.subscriptionStatus === 'trialing' && trialDaysLeft !== null && trialDaysLeft <= 7 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-amber-800 text-sm">
              ⏰ Your free trial ends in {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}
            </p>
            <p className="text-amber-600 text-xs mt-0.5">
              Subscribe to keep your booking page active after the trial ends.
            </p>
          </div>
          <Button onClick={handleSubscribe} size="sm" className="flex-shrink-0">
            Subscribe — $9/mo
          </Button>
        </div>
      )}

      {!isActive && session?.user?.subscriptionStatus !== 'trialing' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-red-800 text-sm">⚠️ Your booking page is paused</p>
            <p className="text-red-600 text-xs mt-0.5">
              Customers cannot book until you have an active subscription.
            </p>
          </div>
          <Button onClick={handleSubscribe} size="sm" className="flex-shrink-0">
            Subscribe now
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Upcoming', value: upcomingBookings.length, color: 'text-indigo-600' },
          { label: 'Total bookings', value: bookings.filter(b => b.status === 'confirmed').length + bookings.filter(b => b.status === 'cancelled').length, color: 'text-gray-900' },
          { label: 'Cancelled', value: bookings.filter((b) => b.status === 'cancelled').length, color: 'text-red-500' },
          {
            label: 'Status',
            value: isActive ? 'Active' : 'Inactive',
            color: isActive ? 'text-green-600' : 'text-red-500',
          },
        ].map((stat) => (
          <Card key={stat.label} padding="sm">
            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Bookings table */}
      <Card padding="none">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Upcoming ({upcomingBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'past'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Past & Cancelled ({pastBookings.length})
            </button>
          </div>

          <div className="flex gap-2">
            {session?.user?.subscriptionStatus === 'active' && (
              <Button onClick={handleManageBilling} variant="secondary" size="sm">
                Manage billing
              </Button>
            )}
            {session?.user?.slug && (
              <a
                href={`/${session.user.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="sm">
                  View booking page ↗
                </Button>
              </a>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : displayBookings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium">No {activeTab} bookings</p>
            {activeTab === 'upcoming' && session?.user?.slug && (
              <p className="text-xs mt-1">
                Share your booking page:{' '}
                <a href={`/${session.user.slug}`} target="_blank" className="text-indigo-500 hover:underline">
                  /{session.user.slug}
                </a>
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{booking.customer_name}</p>
                      <p className="text-gray-400 text-xs">{booking.customer_email}</p>
                      {booking.customer_phone && (
                        <p className="text-gray-400 text-xs">{booking.customer_phone}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{booking.service_name}</p>
                      <p className="text-gray-400 text-xs">{booking.service_duration} min</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{formatDate(booking.date)}</p>
                      <p className="text-gray-400 text-xs">
                        {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {booking.status === 'confirmed' ? '● Confirmed' : '✕ Cancelled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {booking.status === 'confirmed' && isUpcoming(booking) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCancelModal(booking)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Cancel confirmation modal */}
      <Modal
        isOpen={!!cancelModal}
        onClose={() => setCancelModal(null)}
        title="Cancel booking?"
      >
        {cancelModal && (
          <div>
            <p className="text-gray-600 text-sm mb-4">
              This will cancel the booking for{' '}
              <strong>{cancelModal.customer_name}</strong> ({cancelModal.service_name} on{' '}
              {formatDate(cancelModal.date)} at {formatTime(cancelModal.start_time)}) and send them
              a cancellation email.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setCancelModal(null)}>
                Keep booking
              </Button>
              <Button variant="danger" loading={cancelling} onClick={handleCancel}>
                Yes, cancel it
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
