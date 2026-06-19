import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbAll, DbUser, DbWorkingHours } from '@/lib/database';
import { isSubscriptionActive } from '@/lib/stripe';

export async function GET(
  _request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const user = await dbGet<DbUser>(
      'SELECT id, name, email, slug, business_name, subscription_status, trial_end FROM users WHERE slug = ?',
      params.username.toLowerCase()
    );

    if (!user) {
      return NextResponse.json({ error: 'Business not found.' }, { status: 404 });
    }

    const active = isSubscriptionActive(user.subscription_status, user.trial_end);

    const services = await dbAll('SELECT * FROM services WHERE user_id = ? ORDER BY created_at ASC', user.id);

    const workingHours = await dbAll<DbWorkingHours>(
      'SELECT * FROM working_hours WHERE user_id = ? ORDER BY day_of_week ASC',
      user.id
    );

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
