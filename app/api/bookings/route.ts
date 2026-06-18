import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb, DbService, DbWorkingHours } from '@/lib/database';
import {
  sendBookingConfirmationToCustomer,
  sendBookingNotificationToBusiness,
} from '@/lib/email';

// GET /api/bookings — authenticated, returns business's own bookings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const bookings = db
      .prepare(`
        SELECT * FROM bookings
        WHERE user_id = ?
        ORDER BY date DESC, start_time DESC
      `)
      .all(Number(session.user.id));

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings.' }, { status: 500 });
  }
}

// POST /api/bookings — public, creates a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      date,
      startTime,
    } = body;

    if (!businessId || !serviceId || !customerName || !customerEmail || !date || !startTime) {
      return NextResponse.json({ error: 'All required fields must be provided.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const db = getDb();

    // Validate business exists and is active
    const business = db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(Number(businessId)) as any;
    if (!business) {
      return NextResponse.json({ error: 'Business not found.' }, { status: 404 });
    }

    // Check subscription
    const now = Math.floor(Date.now() / 1000);
    const isActive =
      business.subscription_status === 'active' ||
      (business.subscription_status === 'trialing' &&
        business.trial_end &&
        now < business.trial_end);

    if (!isActive) {
      return NextResponse.json(
        { error: 'This booking page is currently unavailable.' },
        { status: 403 }
      );
    }

    // Validate service belongs to business
    const service = db
      .prepare('SELECT * FROM services WHERE id = ? AND user_id = ?')
      .get(Number(serviceId), Number(businessId)) as DbService | undefined;
    if (!service) {
      return NextResponse.json({ error: 'Service not found.' }, { status: 404 });
    }

    // Calculate end time
    const [startHour, startMin] = startTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = startMinutes + service.duration;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    // Validate date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = date.split('-').map(Number);
    const bookingDate = new Date(year, month - 1, day);
    if (bookingDate < today) {
      return NextResponse.json({ error: 'Cannot book appointments in the past.' }, { status: 400 });
    }

    // Validate day of week against working hours
    const dayOfWeek = bookingDate.getDay();
    const workingHour = db
      .prepare('SELECT * FROM working_hours WHERE user_id = ? AND day_of_week = ?')
      .get(Number(businessId), dayOfWeek) as DbWorkingHours | undefined;

    if (!workingHour || !workingHour.is_active) {
      return NextResponse.json(
        { error: 'The business is not open on this day.' },
        { status: 400 }
      );
    }

    // Validate time is within working hours
    const [whStartHour, whStartMin] = workingHour.start_time.split(':').map(Number);
    const [whEndHour, whEndMin] = workingHour.end_time.split(':').map(Number);
    const whStartMinutes = whStartHour * 60 + whStartMin;
    const whEndMinutes = whEndHour * 60 + whEndMin;

    if (startMinutes < whStartMinutes || endMinutes > whEndMinutes) {
      return NextResponse.json(
        { error: 'Selected time is outside of business hours.' },
        { status: 400 }
      );
    }

    // Check for conflicts with existing bookings
    const conflicts = db
      .prepare(`
        SELECT id FROM bookings
        WHERE user_id = ?
          AND date = ?
          AND status = 'confirmed'
          AND start_time < ?
          AND end_time > ?
      `)
      .all(Number(businessId), date, endTime, startTime);

    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please choose another.' },
        { status: 409 }
      );
    }

    // Create the booking
    const result = db
      .prepare(`
        INSERT INTO bookings
          (user_id, service_id, service_name, service_duration, service_price,
           customer_name, customer_email, customer_phone, date, start_time, end_time, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
      `)
      .run(
        Number(businessId),
        service.id,
        service.name,
        service.duration,
        service.price,
        customerName.trim(),
        customerEmail.toLowerCase().trim(),
        customerPhone?.trim() || null,
        date,
        startTime,
        endTime
      );

    const bookingId = result.lastInsertRowid as number;

    // Send emails (non-blocking — don't fail booking if email fails)
    const emailData = {
      customerName: customerName.trim(),
      customerEmail: customerEmail.toLowerCase().trim(),
      businessName: business.business_name || business.name,
      businessEmail: business.email,
      serviceName: service.name,
      date,
      startTime,
      endTime,
      bookingId,
    };

    Promise.all([
      sendBookingConfirmationToCustomer(emailData).catch(console.error),
      sendBookingNotificationToBusiness(emailData).catch(console.error),
    ]);

    return NextResponse.json({ bookingId }, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: 'Failed to create booking. Please try again.' }, { status: 500 });
  }
}
