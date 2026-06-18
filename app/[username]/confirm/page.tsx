'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Booking {
  id: number;
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  customerName: string;
  customerEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  businessName: string;
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function ConfirmContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) {
        setError('No booking ID provided.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (res.ok) {
          const data = await res.json();
          setBooking(data.booking);
        } else {
          setError('Booking not found.');
        }
      } catch {
        setError('Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500">{error || 'Something went wrong.'}</p>
          <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline text-sm">
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Booking confirmed!</h1>
          <p className="text-gray-500 mt-2 text-sm">
            We&apos;ve sent a confirmation to{' '}
            <strong className="text-gray-700">{booking.customerEmail}</strong>
          </p>
        </div>

        {/* Booking details card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
            Appointment details
          </h2>
          <dl className="space-y-3">
            {[
              { label: 'Business', value: booking.businessName },
              { label: 'Service', value: `${booking.serviceName} (${booking.serviceDuration} min)` },
              { label: 'Date', value: formatDate(booking.date) },
              { label: 'Time', value: `${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}` },
              ...(booking.servicePrice > 0
                ? [{ label: 'Price', value: `$${booking.servicePrice.toFixed(2)}` }]
                : []),
              { label: 'Booking ID', value: `#${booking.id}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-4">
                <dt className="w-24 text-sm text-gray-500 flex-shrink-0">{label}</dt>
                <dd className="text-sm font-medium text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700 mb-6">
          <p className="font-medium mb-1">Need to reschedule or cancel?</p>
          <p className="text-indigo-600 text-xs">
            Contact {booking.businessName} directly. Your booking reference is{' '}
            <strong>#{booking.id}</strong>.
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-400 mb-2">Powered by</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-indigo-600 font-semibold hover:text-indigo-700"
          >
            <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            BookEasy
          </Link>
          <p className="text-xs text-gray-400 mt-1">
            Want a booking page like this for your business?{' '}
            <Link href="/register" className="text-indigo-500 hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmContent />
    </Suspense>
  );
}
