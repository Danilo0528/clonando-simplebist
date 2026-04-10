import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getPTCTasks, completePTCTask, getPTCStats } from '../../../lib/ptc';

// GET - Fetch PTC tasks and stats
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
      const stats = await getPTCStats(userId);
      return NextResponse.json({ stats });
    }

    const tasks = await getPTCTasks(userId);
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('PTC GET error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      message: 'Failed to fetch PTC data',
      error: error.message 
    }, { status: 500 });
  }
}

// POST - Complete a PTC task
export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const body = await request.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json({ message: 'Task ID is required' }, { status: 400 });
    }

    const result = await completePTCTask(userId, taskId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('PTC POST error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      message: 'Failed to complete PTC task',
      error: error.message 
    }, { status: 500 });
  }
}
