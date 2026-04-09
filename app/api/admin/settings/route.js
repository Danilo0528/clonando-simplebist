import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getUserFromRequest } from '../../../../lib/auth';

// GET - Get all settings
export async function GET(request) {
  try {
    const user = await getUserFromRequest({
      headers: {
        authorization: request.headers.get('authorization'),
        cookie: request.headers.get('cookie'),
      },
    });

    if (!user || !user.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const settings = await prisma.setting.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    // Convert to key-value object for easier use
    const settingsMap = {};
    settings.forEach((s) => {
      settingsMap[s.key] = {
        value: s.value,
        category: s.category,
      };
    });

    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ message: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT - Update settings
export async function PUT(request) {
  try {
    const user = await getUserFromRequest({
      headers: {
        authorization: request.headers.get('authorization'),
        cookie: request.headers.get('cookie'),
      },
    });

    if (!user || !user.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { message: 'Settings object is required' },
        { status: 400 }
      );
    }

    // Update all settings in a transaction
    const updates = Object.entries(settings).map(([key, data]) => {
      return prisma.setting.upsert({
        where: { key },
        create: {
          key,
          value: data.value,
          category: data.category || 'general',
        },
        update: {
          value: data.value,
          category: data.category || 'general',
        },
      });
    });

    await prisma.$transaction(updates);

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ message: 'Failed to update settings' }, { status: 500 });
  }
}
