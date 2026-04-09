import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getUserFromRequest } from '../../../../lib/auth';

// GET - Get all announcements
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

    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ message: 'Failed to fetch announcements' }, { status: 500 });
  }
}

// POST - Create new announcement
export async function POST(request) {
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
    const { title, content, type, priority } = body;

    if (!title || !content) {
      return NextResponse.json(
        { message: 'Title and content are required' },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        type: type || 'info',
        priority: priority || 0,
      },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ message: 'Failed to create announcement' }, { status: 500 });
  }
}

// PUT - Update announcement
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
    const { id, title, content, type, isActive, priority } = body;

    if (!id) {
      return NextResponse.json({ message: 'Announcement ID is required' }, { status: 400 });
    }

    const announcement = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(type && { type }),
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(typeof priority === 'number' && { priority }),
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json({ message: 'Failed to update announcement' }, { status: 500 });
  }
}

// DELETE - Delete announcement
export async function DELETE(request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Announcement ID is required' }, { status: 400 });
    }

    await prisma.announcement.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json({ message: 'Failed to delete announcement' }, { status: 500 });
  }
}
