import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Set up a simple SSE (Server-Sent Events) endpoint
export default async function handler(req, res) {
  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  // Store the interval reference
  let interval;

  // Send periodic heartbeat to keep connection alive
  interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`);
  }, 30000); // Send heartbeat every 30 seconds

  // Handle user disconnection
  req.on('close', () => {
    clearInterval(interval);
  });

  // Handle errors
  req.on('error', (err) => {
    console.error('SSE connection error:', err);
    clearInterval(interval);
  });
}

// Config to allow streaming responses
export const config = {
  api: {
    responseLimit: false,
    bodyParser: false,
  },
};