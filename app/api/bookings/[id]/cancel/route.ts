import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbGet, dbRun, DbBooking } from '@/lib/database';
import { sendCancellationEmail } from '@/lib/email';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const booking = await dbGet<DbBooking>(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      Number(params.id), Number(session.user.id)
    );

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Booking is already cancelled.' }, { status: 400 });
    }

    await dbRun('UPDATE bookings SET status = ? WHERE id = ?', 'cancelled', booking.id);

    const business = await dbGet<{ business_name: string | null; name: string }>(
      'SELECT business_name, name FROM users WHERE id = ?',
      Number(session.user.id)
    );

    sendCancellationEmail({
      customerName: booking.customer_name,
      customerEmail: booking.customer_email,
      businessName: business?.business_name || business?.name || 'The business',
      serviceName: booking.service_name,
      date: booking.date,
      startTime: booking.start_time,
      bookingId: booking.id,
    }).catch(console.error);

    return NextResponse.json({ message: 'Booking cancelled successfully.' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json({ error: 'Failed to cancel booking.' }, { status: 500 });
  }
}
