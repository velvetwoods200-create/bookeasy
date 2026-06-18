import { NextRequest, NextResponse } from 'next/server';
import { getDb, DbWorkingHours, DbBooking, DbService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const serviceId = searchParams.get('serviceId');
    const date = searchParams.get('date');

    if (!businessId || !serviceId || !date) {
      return NextResponse.json(
        { error: 'businessId, serviceId, and date are required.' },
        { status: 400 }
      );
    }

    const db = getDb();

    const service = db
      .prepare('SELECT * FROM services WHERE id = ? AND user_id = ?')
      .get(Number(serviceId), Number(businessId)) as DbService | undefined;

    if (!service) {
      return NextResponse.json({ error: 'Service not found.' }, { status: 404 });
    }

    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();

    const workingHour = db
      .prepare('SELECT * FROM working_hours WHERE user_id = ? AND day_of_week = ?')
      .get(Number(businessId), dayOfWeek) as DbWorkingHours | undefined;

    if (!workingHour || !workingHour.is_active) {
      return NextResponse.json({ slots: [] });
    }

    // Get all confirmed bookings for this date
    const existingBookings = db
      .prepare(`
        SELECT start_time, end_time FROM bookings
        WHERE user_id = ? AND date = ? AND status = 'confirmed'
      `)
      .all(Number(businessId), date) as Pick<DbBooking, 'start_time' | 'end_time'>[];

    // Generate 30-minute slots
    const [startHour, startMin] = workingHour.start_time.split(':').map(Number);
    const [endHour, endMin] = workingHour.end_time.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    const slots: string[] = [];
    for (let t = startMinutes; t + service.duration <= endMinutes; t += 30) {
      const slotEndMinutes = t + service.duration;
      const slotHour = Math.floor(t / 60);
      const slotMin = t % 60;
      const slotTime = `${String(slotHour).padStart(2, '0')}:${String(slotMin).padStart(2, '0')}`;
      const slotEndHour = Math.floor(slotEndMinutes / 60);
      const slotEndMin = slotEndMinutes % 60;
      const slotEndTime = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`;

      // Check if this slot conflicts with any existing booking
      const hasConflict = existingBookings.some((booking) => {
        return slotTime < booking.end_time && slotEndTime > booking.start_time;
      });

      if (!hasConflict) {
        slots.push(slotTime);
      }
    }

    // Filter out past slots if the date is today
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    let availableSlots = slots;

    if (date === todayStr) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes() + 30; // 30-min buffer
      availableSlots = slots.filter((slot) => {
        const [h, m] = slot.split(':').map(Number);
        return h * 60 + m >= currentMinutes;
      });
    }

    return NextResponse.json({ slots: availableSlots });
  } catch (error) {
    console.error('Get availability error:', error);
    return NextResponse.json({ error: 'Failed to fetch availability.' }, { status: 500 });
  }
}
