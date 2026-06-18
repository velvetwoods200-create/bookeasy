import { NextRequest, NextResponse } from 'next/server';
import { getDb, DbUser, DbWorkingHours } from '@/lib/database';
import { isSubscriptionActive } from '@/lib/stripe';

export async function GET(
  _request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const db = getDb();

    const user = db
      .prepare('SELECT * FROM users WHERE slug = ?')
      .get(params.username.toLowerCase()) as DbUser | undefined;

    if (!user) {
      return NextResponse.json({ error: 'Business not found.' }, { status: 404 });
    }

    const active = isSubscriptionActive(user.subscription_status, user.trial_end);

    const services = db
      .prepare('SELECT * FROM services WHERE user_id = ? ORDER BY created_at ASC')
      .all(user.id);

    const workingHours = db
      .prepare('SELECT * FROM working_hours WHERE user_id = ? ORDER BY day_of_week ASC')
      .all(user.id) as DbWorkingHours[];

    return NextResponse.json({
      business: {
        id: user.id,
        name: user.business_name || user.name,
        email: user.email,
        slug: user.slug,
        isActive: active,
        subscriptionStatus: user.subscription_status,
      },
      services,
      workingHours,
    });
  } catch (error) {
    console.error('Get business error:', error);
    return NextResponse.json({ error: 'Failed to fetch business.' }, { status: 500 });
  }
}
