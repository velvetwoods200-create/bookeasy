'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CalendarPicker from '@/components/CalendarPicker';
import TimeSlotPicker from '@/components/TimeSlotPicker';
import Button from '@/components/Button';
import Card from '@/components/Card';

interface Business {
  id: number;
  name: string;
  email: string;
  slug: string;
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

type Step = 'service' | 'datetime' | 'details' | 'review';

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

const STEPS: { key: Step; label: string }[] = [
  { key: 'service', label: 'Service' },
  { key: 'datetime', label: 'Date & Time' },
  { key: 'details', label: 'Your Details' },
  { key: 'review', label: 'Confirm' },
];

export default function BookingForm({
  business,
  services,
  workingHours,
}: {
  business: Business;
  services: Service[];
  workingHours: WorkingHour[];
}) {
  const router = useRouter();

  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fetchSlots = useCallback(async () => {
    if (!selectedService || !selectedDate) return;
    setSlotsLoading(true);
    setSelectedTime(null);
    try {
      const res = await fetch(
        `/api/availability?businessId=${business.id}&serviceId=${selectedService.id}&date=${selectedDate}`
      );
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots);
      }
    } finally {
      setSlotsLoading(false);
    }
  }, [selectedService, selectedDate, business.id]);

  useEffect(() => {
    if (step === 'datetime' && selectedDate) {
      fetchSlots();
    }
  }, [selectedDate, step, fetchSlots]);

  function handleServiceSelect(svc: Service) {
    setSelectedService(svc);
    setSelectedDate(null);
    setSelectedTime(null);
    setSlots([]);
    setStep('datetime');
  }

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setSelectedTime(null);
  }

  function canProceedToDetails() {
    return selectedDate && selectedTime;
  }

  function validateDetails() {
    if (!customerDetails.name.trim()) return 'Please enter your name.';
    if (!customerDetails.email.trim()) return 'Please enter your email.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerDetails.email)) return 'Please enter a valid email.';
    return null;
  }

  async function handleSubmit() {
    const error = validateDetails();
    if (error) {
      setSubmitError(error);
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          serviceId: selectedService!.id,
          customerName: customerDetails.name,
          customerEmail: customerDetails.email,
          customerPhone: customerDetails.phone,
          date: selectedDate,
          startTime: selectedTime,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Failed to book appointment. Please try again.');
        setSubmitting(false);
        return;
      }

      router.push(`/${business.slug}/confirm?bookingId=${data.bookingId}`);
    } catch {
      setSubmitError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div>
      {/* Progress steps */}
      <div className="flex items-center justify-center mb-8 gap-2">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < currentStepIndex
                    ? 'bg-indigo-600 text-white'
                    : i === currentStepIndex
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i < currentStepIndex ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  i === currentStepIndex ? 'text-indigo-700' : 'text-gray-400'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 ${i < currentStepIndex ? 'bg-indigo-400' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step: Service */}
      {step === 'service' && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Choose a service</h2>
          <p className="text-gray-500 text-sm mb-6">Select what you&apos;d like to book with {business.name}.</p>
          <div className="space-y-3">
            {services.map((svc) => (
              <button
                key={svc.id}
                onClick={() => handleServiceSelect(svc)}
                className="w-full text-left bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                      {svc.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{svc.duration} minutes</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {svc.price > 0 && (
                      <span className="text-lg font-bold text-gray-900">
                        ${svc.price.toFixed(2)}
                      </span>
                    )}
                    <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Date & Time */}
      {step === 'datetime' && selectedService && (
        <div>
          <button
            onClick={() => setStep('service')}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mb-4 font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h2 className="text-xl font-bold text-gray-900 mb-2">Choose a date & time</h2>
          <p className="text-gray-500 text-sm mb-6">
            Booking: <strong>{selectedService.name}</strong> ({selectedService.duration} min)
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Select date</h3>
              <CalendarPicker
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                workingHours={workingHours}
              />
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">
                {selectedDate ? `Available times` : 'Select a date first'}
              </h3>
              {selectedDate ? (
                <TimeSlotPicker
                  slots={slots}
                  selectedSlot={selectedTime}
                  onSlotSelect={setSelectedTime}
                  loading={slotsLoading}
                />
              ) : (
                <div className="flex items-center justify-center h-40 text-gray-300">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </Card>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              disabled={!canProceedToDetails()}
              onClick={() => setStep('details')}
              size="lg"
            >
              Continue
              <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      )}

      {/* Step: Customer Details */}
      {step === 'details' && (
        <div>
          <button
            onClick={() => setStep('datetime')}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mb-4 font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h2 className="text-xl font-bold text-gray-900 mb-2">Your details</h2>
          <p className="text-gray-500 text-sm mb-6">
            {selectedDate && selectedTime && (
              <>
                {formatDate(selectedDate)} at {formatTime(selectedTime)} ·{' '}
                {selectedService?.name}
              </>
            )}
          </p>

          <Card>
            <div className="space-y-4">
              <div>
                <label htmlFor="cust-name">Full name *</label>
                <input
                  id="cust-name"
                  type="text"
                  value={customerDetails.name}
                  onChange={(e) =>
                    setCustomerDetails((d) => ({ ...d, name: e.target.value }))
                  }
                  placeholder="Your full name"
                  required
                  autoComplete="name"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="cust-email">Email address *</label>
                <input
                  id="cust-email"
                  type="email"
                  value={customerDetails.email}
                  onChange={(e) =>
                    setCustomerDetails((d) => ({ ...d, email: e.target.value }))
                  }
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
                <p className="text-xs text-gray-400 mt-1">
                  We&apos;ll send your confirmation here.
                </p>
              </div>
              <div>
                <label htmlFor="cust-phone">Phone number (optional)</label>
                <input
                  id="cust-phone"
                  type="tel"
                  value={customerDetails.phone}
                  onChange={(e) =>
                    setCustomerDetails((d) => ({ ...d, phone: e.target.value }))
                  }
                  placeholder="+1 555-000-0000"
                  autoComplete="tel"
                />
              </div>
            </div>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => {
                const err = validateDetails();
                if (err) {
                  setSubmitError(err);
                  return;
                }
                setSubmitError('');
                setStep('review');
              }}
              size="lg"
            >
              Review booking
            </Button>
          </div>
          {submitError && step === 'details' && (
            <p className="mt-3 text-sm text-red-600 text-right">{submitError}</p>
          )}
        </div>
      )}

      {/* Step: Review & Confirm */}
      {step === 'review' && selectedService && selectedDate && selectedTime && (
        <div>
          <button
            onClick={() => setStep('details')}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mb-4 font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h2 className="text-xl font-bold text-gray-900 mb-2">Review & confirm</h2>
          <p className="text-gray-500 text-sm mb-6">
            Please check the details below before confirming.
          </p>

          <Card className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              Booking summary
            </h3>
            <dl className="space-y-3">
              {[
                { label: 'Business', value: business.name },
                { label: 'Service', value: `${selectedService.name} (${selectedService.duration} min)` },
                { label: 'Date', value: formatDate(selectedDate) },
                { label: 'Time', value: formatTime(selectedTime) },
                ...(selectedService.price > 0
                  ? [{ label: 'Price', value: `$${selectedService.price.toFixed(2)}` }]
                  : []),
                { label: 'Your name', value: customerDetails.name },
                { label: 'Your email', value: customerDetails.email },
                ...(customerDetails.phone ? [{ label: 'Phone', value: customerDetails.phone }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-4">
                  <dt className="w-28 text-sm text-gray-500 flex-shrink-0">{label}</dt>
                  <dd className="text-sm font-medium text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {submitError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {submitError}
            </div>
          )}

          <Button onClick={handleSubmit} loading={submitting} size="lg" className="w-full">
            Confirm booking
          </Button>
          <p className="text-xs text-center text-gray-400 mt-3">
            A confirmation email will be sent to {customerDetails.email}
          </p>
        </div>
      )}
    </div>
  );
}
