import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbGet, DbUser } from '@/lib/database';
import { createPortalSession } from '@/lib/stripe';

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await dbGet<DbUser>('SELECT * FROM users WHERE id = ?', Number(session.user.id));

    if (!user || !user.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found. Please subscribe first.' },
        { status: 400 }
      );
    }

    const appUrl = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.simple-g.com').replace(/\/$/, '');
    const portalUrl = await createPortalSession(user.stripe_customer_id, appUrl);

    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json({ error: 'Failed to open billing portal.' }, { status: 500 });
  }
}
