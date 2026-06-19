import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { dbGet, dbAll, DbUser, DbWorkingHours } from '@/lib/database';
import { isSubscriptionActive } from '@/lib/stripe';
import BookingForm from './BookingForm';

interface Business {
  id: number;
  name: string;
  email: string;
  slug: string;
  isActive: boolean;
  subscriptionStatus: string;
}

interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
}

interface WorkingHour {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: number;
}

const getBusinessData = cache(async (username: string) => {
  const user = await dbGet<DbUser>(
    'SELECT id, name, email, slug, business_name, subscription_status, trial_end FROM users WHERE slug = ?',
    username.toLowerCase()
  );
  if (!user) return null;

  const services = await dbAll<Service>(
    'SELECT id, name, duration, price FROM services WHERE user_id = ? ORDER BY created_at ASC',
    user.id
  );

  const workingHours = await dbAll<DbWorkingHours>(
    'SELECT * FROM working_hours WHERE user_id = ? ORDER BY day_of_week ASC',
    user.id
  );

  return {
    business: {
      id: user.id,
      name: user.business_name || user.name,
      email: user.email,
      slug: user.slug,
      isActive: isSubscriptionActive(user.subscription_status, user.trial_end),
      subscriptionStatus: user.subscription_status,
    } as Business,
    services,
    workingHours,
  };
});

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const data = await getBusinessData(params.username);
  if (!data) return { title: 'Not found' };
  return {
    title: `Book an appointment with ${data.business.name}`,
    description: `Schedule your appointment with ${data.business.name} online — fast and easy.`,
  };
}

export default async function BookingPage({ params }: { params: { username: string } }) {
  const data = await getBusinessData(params.username);

  if (!data) notFound();

  const { business, services, workingHours } = data;

  if (!business.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Online booking unavailable</h1>
          <p className="text-gray-500 text-sm">
            <strong>{business.name}</strong> is not currently accepting online bookings. Please
            contact them directly to schedule an appointment.
          </p>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{business.name}</h1>
          <p className="text-gray-500 text-sm">
            This business hasn&apos;t set up their services yet. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="bg-white border-b border-gray-100 py-5 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
            <p className="text-sm text-gray-500">Online Appointment Booking</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Powered by</p>
            <p className="text-sm font-semibold text-indigo-600">Simple-G</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <BookingForm
          business={business}
          services={services}
          workingHours={workingHours}
        />
      </div>
    </div>
  );
}
