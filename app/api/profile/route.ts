import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbGet, dbRun, DbUser } from '@/lib/database';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { businessName, slug } = body;

    if (!businessName) {
      return NextResponse.json({ error: 'Business name is required.' }, { status: 400 });
    }

    // Fetch current user to preserve slug if not changing it
    const currentUser = await dbGet<DbUser>('SELECT slug FROM users WHERE id = ?', Number(session.user.id));
    let newSlug = currentUser?.slug ?? null;

    if (slug && slug.trim() !== '') {
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slug)) {
        return NextResponse.json(
          { error: 'Booking URL can only contain lowercase letters, numbers, and hyphens.' },
          { status: 400 }
        );
      }
      if (slug.length < 3 || slug.length > 50) {
        return NextResponse.json(
          { error: 'Booking URL must be between 3 and 50 characters.' },
          { status: 400 }
        );
      }
      const existingSlug = await dbGet(
        'SELECT id FROM users WHERE slug = ? AND id != ?',
        slug.toLowerCase(), Number(session.user.id)
      );
      if (existingSlug) {
        return NextResponse.json(
          { error: 'This booking URL is already taken. Please choose another.' },
          { status: 409 }
        );
      }
      newSlug = slug.toLowerCase();
    }

    await dbRun(
      'UPDATE users SET business_name = ?, slug = ? WHERE id = ?',
      businessName.trim(), newSlug, Number(session.user.id)
    );

    return NextResponse.json({
      message: 'Profile updated successfully.',
      user: { businessName: businessName.trim(), slug: newSlug },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
