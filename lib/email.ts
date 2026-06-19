import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function formatTime(time: string): string {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr || '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${ampm}`;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  businessName: string;
  businessEmail: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  bookingId: number;
}

export async function sendBookingConfirmationToCustomer(data: BookingEmailData): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

  const { error } = await resend.emails.send({
    from: 'Simple-G <onboarding@resend.dev>',
    to: data.customerEmail,
    subject: `Booking Confirmed — ${data.serviceName} at ${data.businessName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: white; border-radius: 8px; padding: 32px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">Simple-G</h1>
          </div>
          <h2 style="color: #111827; font-size: 22px; margin-bottom: 8px;">Your booking is confirmed! ✓</h2>
          <p style="color: #6b7280; margin-top: 0;">Hi ${data.customerName}, here are your booking details:</p>
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Business</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.businessName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.serviceName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">${formatDate(data.date)}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">${formatTime(data.startTime)} – ${formatTime(data.endTime)}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Booking ID</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">#${data.bookingId}</td></tr>
            </table>
          </div>
          <p style="color: #6b7280; font-size: 14px;">If you need to cancel, please contact ${data.businessName} at <a href="mailto:${data.businessEmail}" style="color: #4f46e5;">${data.businessEmail}</a>.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">Powered by <a href="${appUrl}" style="color: #4f46e5; text-decoration: none;">Simple-G</a></p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error('Resend error (customer):', error);
    throw error;
  }
}

export async function sendBookingNotificationToBusiness(data: BookingEmailData): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

  const { error } = await resend.emails.send({
    from: 'Simple-G <onboarding@resend.dev>',
    to: data.businessEmail,
    subject: `New Booking: ${data.customerName} — ${data.serviceName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: white; border-radius: 8px; padding: 32px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">Simple-G</h1>
          </div>
          <h2 style="color: #111827; font-size: 22px; margin-bottom: 8px;">New booking received!</h2>
          <p style="color: #6b7280; margin-top: 0;">You have a new appointment booking.</p>
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Customer</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.customerName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email</td><td style="padding: 8px 0; color: #111827; font-weight: 600;"><a href="mailto:${data.customerEmail}" style="color: #4f46e5;">${data.customerEmail}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.serviceName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">${formatDate(data.date)}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">${formatTime(data.startTime)} – ${formatTime(data.endTime)}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Booking ID</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">#${data.bookingId}</td></tr>
            </table>
          </div>
          <a href="${appUrl}/dashboard" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">View in Dashboard →</a>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">Powered by <a href="${appUrl}" style="color: #4f46e5; text-decoration: none;">Simple-G</a></p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error('Resend error (business):', error);
    throw error;
  }
}

interface CancellationEmailData {
  customerName: string;
  customerEmail: string;
  businessName: string;
  serviceName: string;
  date: string;
  startTime: string;
  bookingId: number;
}

export async function sendCancellationEmail(data: CancellationEmailData): Promise<void> {
  const { error } = await resend.emails.send({
    from: 'Simple-G <onboarding@resend.dev>',
    to: data.customerEmail,
    subject: `Booking Cancelled — ${data.serviceName} at ${data.businessName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: white; border-radius: 8px; padding: 32px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">Simple-G</h1>
          </div>
          <h2 style="color: #111827; font-size: 22px; margin-bottom: 8px;">Booking Cancelled</h2>
          <p style="color: #6b7280; margin-top: 0;">Hi ${data.customerName}, your booking has been cancelled.</p>
          <div style="background: #fef2f2; border-radius: 8px; padding: 20px; margin: 24px 0; border: 1px solid #fecaca;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Business</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.businessName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">${data.serviceName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Was scheduled for</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">${formatDate(data.date)} at ${formatTime(data.startTime)}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Booking ID</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">#${data.bookingId}</td></tr>
            </table>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Please contact ${data.businessName} to reschedule.</p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error('Resend error (cancellation):', error);
    throw error;
  }
}
