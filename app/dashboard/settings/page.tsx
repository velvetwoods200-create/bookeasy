'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Modal from '@/components/Modal';

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

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_WORKING_HOURS: WorkingHour[] = Array.from({ length: 7 }, (_, i) => ({
  day_of_week: i,
  start_time: '09:00',
  end_time: '17:00',
  is_active: i >= 1 && i <= 5 ? 1 : 0,
}));

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();

  // Profile state
  const [profile, setProfile] = useState({
    businessName: '',
    slug: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Services state
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [serviceModal, setServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({ name: '', duration: '30', price: '0' });
  const [serviceSaving, setServiceSaving] = useState(false);
  const [serviceError, setServiceError] = useState('');

  // Working hours state
  const [hours, setHours] = useState<WorkingHour[]>(DEFAULT_WORKING_HOURS);
  const [hoursSaving, setHoursSaving] = useState(false);
  const [hoursMsg, setHoursMsg] = useState('');

  const fetchServices = useCallback(async () => {
    const res = await fetch('/api/services');
    if (res.ok) {
      const data = await res.json();
      setServices(data.services);
    }
    setServicesLoading(false);
  }, []);

  const fetchHours = useCallback(async () => {
    const res = await fetch('/api/working-hours');
    if (res.ok) {
      const data = await res.json();
      if (data.hours && data.hours.length > 0) {
        setHours(data.hours);
      }
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      setProfile({
        businessName: session.user.businessName || session.user.name || '',
        slug: session.user.slug || '',
      });
    }
    fetchServices();
    fetchHours();
  }, [session, fetchServices, fetchHours]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    setProfileError('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg('Profile saved successfully!');
        await updateSession();
        setTimeout(() => setProfileMsg(''), 3000);
      } else {
        setProfileError(data.error || 'Failed to save profile.');
      }
    } finally {
      setProfileSaving(false);
    }
  }

  function openAddService() {
    setEditingService(null);
    setServiceForm({ name: '', duration: '30', price: '0' });
    setServiceError('');
    setServiceModal(true);
  }

  function openEditService(svc: Service) {
    setEditingService(svc);
    setServiceForm({ name: svc.name, duration: String(svc.duration), price: String(svc.price) });
    setServiceError('');
    setServiceModal(true);
  }

  async function saveService(e: React.FormEvent) {
    e.preventDefault();
    setServiceSaving(true);
    setServiceError('');

    try {
      const url = editingService ? `/api/services/${editingService.id}` : '/api/services';
      const method = editingService ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: serviceForm.name,
          duration: Number(serviceForm.duration),
          price: Number(serviceForm.price),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setServiceModal(false);
        fetchServices();
      } else {
        setServiceError(data.error || 'Failed to save service.');
      }
    } finally {
      setServiceSaving(false);
    }
  }

  async function deleteService(id: number) {
    if (!confirm('Delete this service? Existing bookings will not be affected.')) return;
    await fetch(`/api/services/${id}`, { method: 'DELETE' });
    fetchServices();
  }

  async function saveHours(e: React.FormEvent) {
    e.preventDefault();
    setHoursSaving(true);
    setHoursMsg('');

    try {
      const res = await fetch('/api/working-hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours }),
      });
      if (res.ok) {
        setHoursMsg('Working hours saved!');
        setTimeout(() => setHoursMsg(''), 3000);
      }
    } finally {
      setHoursSaving(false);
    }
  }

  function updateHour(dayOfWeek: number, field: keyof WorkingHour, value: string | number) {
    setHours((prev) =>
      prev.map((h) => (h.day_of_week === dayOfWeek ? { ...h, [field]: value } : h))
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://bookeasy.com');

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your business profile, services, and availability.</p>
      </div>

      {/* Profile */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Business Profile</h2>
        <p className="text-sm text-gray-500 mb-5">Your business name and public booking page URL.</p>

        <form onSubmit={saveProfile} className="space-y-4">
          {profileError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {profileError}
            </div>
          )}
          {profileMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {profileMsg}
            </div>
          )}

          <div>
            <label htmlFor="businessName">Business name</label>
            <input
              id="businessName"
              type="text"
              value={profile.businessName}
              onChange={(e) => setProfile((p) => ({ ...p, businessName: e.target.value }))}
              placeholder="My Awesome Business"
              required
            />
          </div>

          <div>
            <label htmlFor="slug">Booking page URL</label>
            <div className="flex items-center gap-0">
              <span className="px-3 py-2 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-500 whitespace-nowrap">
                bookeasy.com/
              </span>
              <input
                id="slug"
                type="text"
                value={profile.slug}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                  }))
                }
                placeholder="your-business"
                className="rounded-l-none"
                minLength={3}
                maxLength={50}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Only lowercase letters, numbers, and hyphens. Min 3 characters.
            </p>
            {profile.slug && (
              <p className="text-xs text-indigo-600 mt-1">
                Your page:{' '}
                <a
                  href={`/${profile.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {appUrl}/{profile.slug}
                </a>
              </p>
            )}
          </div>

          <Button type="submit" loading={profileSaving}>
            Save profile
          </Button>
        </form>
      </Card>

      {/* Services */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-gray-900">Services</h2>
          <Button size="sm" onClick={openAddService}>
            + Add service
          </Button>
        </div>
        <p className="text-sm text-gray-500 mb-5">The services customers can book with you.</p>

        {servicesLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-500 mb-3">No services yet</p>
            <Button size="sm" variant="secondary" onClick={openAddService}>
              Add your first service
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{svc.name}</p>
                  <p className="text-sm text-gray-500">
                    {svc.duration} min
                    {svc.price > 0 && ` · $${svc.price.toFixed(2)}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEditService(svc)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteService(svc.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Working Hours */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Working Hours</h2>
        <p className="text-sm text-gray-500 mb-5">
          Set which days and hours customers can book with you.
        </p>

        <form onSubmit={saveHours} className="space-y-3">
          {hours.map((h) => (
            <div key={h.day_of_week} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
              <div className="w-8">
                <input
                  type="checkbox"
                  id={`day-${h.day_of_week}`}
                  checked={!!h.is_active}
                  onChange={(e) => updateHour(h.day_of_week, 'is_active', e.target.checked ? 1 : 0)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </div>
              <label
                htmlFor={`day-${h.day_of_week}`}
                className={`w-28 font-medium text-sm cursor-pointer mb-0 ${
                  !h.is_active ? 'text-gray-400' : 'text-gray-700'
                }`}
              >
                {DAY_NAMES[h.day_of_week]}
              </label>
              {h.is_active ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={h.start_time}
                    onChange={(e) => updateHour(h.day_of_week, 'start_time', e.target.value)}
                    className="w-auto flex-none"
                    required={!!h.is_active}
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <input
                    type="time"
                    value={h.end_time}
                    onChange={(e) => updateHour(h.day_of_week, 'end_time', e.target.value)}
                    className="w-auto flex-none"
                    required={!!h.is_active}
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-400 italic">Closed</span>
              )}
            </div>
          ))}

          {hoursMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {hoursMsg}
            </div>
          )}

          <Button type="submit" loading={hoursSaving} className="mt-4">
            Save working hours
          </Button>
        </form>
      </Card>

      {/* Service modal */}
      <Modal
        isOpen={serviceModal}
        onClose={() => setServiceModal(false)}
        title={editingService ? 'Edit service' : 'Add service'}
      >
        <form onSubmit={saveService} className="space-y-4">
          {serviceError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {serviceError}
            </div>
          )}

          <div>
            <label htmlFor="svc-name">Service name</label>
            <input
              id="svc-name"
              type="text"
              value={serviceForm.name}
              onChange={(e) => setServiceForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Haircut, Consultation, 60-min massage"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="svc-duration">Duration (minutes)</label>
            <input
              id="svc-duration"
              type="number"
              min="5"
              max="480"
              step="5"
              value={serviceForm.duration}
              onChange={(e) => setServiceForm((f) => ({ ...f, duration: e.target.value }))}
              required
            />
          </div>

          <div>
            <label htmlFor="svc-price">Price ($) — optional</label>
            <input
              id="svc-price"
              type="number"
              min="0"
              step="0.01"
              value={serviceForm.price}
              onChange={(e) => setServiceForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="0.00"
            />
            <p className="text-xs text-gray-400 mt-1">Set to 0 to show as "Free"</p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setServiceModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={serviceSaving}>
              {editingService ? 'Save changes' : 'Add service'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
