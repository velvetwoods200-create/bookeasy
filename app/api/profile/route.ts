import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/database';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { businessName, slug } = body;

    if (!businessName) {
      return NextResponse.json({ error: 'Business name is required.' }, { status: 400 });
    }

    const db = getDb();

    if (slug) {
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

      const existingSlug = db
        .prepare('SELECT id FROM users WHERE slug = ? AND id != ?')
        .get(slug, Number(session.user.id));

      if (existingSlug) {
        return NextResponse.json(
          { error: 'This booking URL is already taken. Please choose another.' },
          { status: 409 }
        );
      }
    }

    db.prepare('UPDATE users SET business_name = ?, slug = ? WHERE id = ?').run(
      businessName.trim(),
      slug ? slug.toLowerCase() : null,
      Number(session.user.id)
    );

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(session.user.id)) as any;

    return NextResponse.json({
      message: 'Profile updated successfully.',
      user: {
        businessName: updated.business_name,
        slug: updated.slug,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
