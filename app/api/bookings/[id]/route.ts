import { NextRequest, NextResponse } from 'next/server';
import { getDb, DbBooking } from '@/lib/database';

// GET /api/bookings/[id] — public, for the confirmation page
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const booking = db
      .prepare(`
        SELECT b.*, u.business_name, u.name as owner_name
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        WHERE b.id = ?
      `)
      .get(Number(params.id)) as (DbBooking & { business_name: string | null; owner_name: string }) | undefined;

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    return NextResponse.json({
      booking: {
        id: booking.id,
        serviceName: booking.service_name,
        serviceDuration: booking.service_duration,
        servicePrice: booking.service_price,
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        customerPhone: booking.customer_phone,
        date: booking.date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        status: booking.status,
        businessName: booking.business_name || booking.owner_name,
        createdAt: booking.created_at,
      },
    });
  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json({ error: 'Failed to fetch booking.' }, { status: 500 });
  }
}
