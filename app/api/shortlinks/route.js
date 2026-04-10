import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getAvailableShortlinks, completeShortlink, getShortlinkStats } from '../../../lib/shortlinks';

// GET - Fetch shortlinks and stats
export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      const stats = await getShortlinkStats(userId);
      return NextResponse.json({ stats });
    }

    const shortlinks = await getAvailableShortlinks(userId);
    return NextResponse.json({ shortlinks });
  } catch (error) {
    console.error('Shortlinks GET error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      message: 'Failed to fetch shortlinks',
      error: error.message 
    }, { status: 500 });
  }
}

// POST - Complete a shortlink
export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const body = await request.json();
    const { shortlinkId } = body;

    if (!shortlinkId) {
      return NextResponse.json({ message: 'Shortlink ID is required' }, { status: 400 });
    }

    const result = await completeShortlink(userId, shortlinkId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Shortlinks POST error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      message: 'Failed to complete shortlink',
      error: error.message 
    }, { status: 500 });
  }
}
