// Server-Sent Events API route for real-time updates
// This provides real-time updates without requiring a separate WebSocket server

export default function handler(req, res) {
  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to event stream' })}\n\n`);

  // Send periodic heartbeat
  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
  }, 30000);

  // Simulate sending updates (in a real app, these would come from actual events)
  const sampleUpdates = [
    { type: 'balance_update', userId: 1, balance: 100.5, timestamp: Date.now() },
    { type: 'faucet_claim', userId: 1, reward: 0.01, timestamp: Date.now() },
    { type: 'ptc_click', userId: 1, reward: 0.005, timestamp: Date.now() },
  ];

  // Send sample updates every 10 seconds
  const updateInterval = setInterval(() => {
    const update = sampleUpdates[Math.floor(Math.random() * sampleUpdates.length)];
    res.write(`data: ${JSON.stringify(update)}\n\n`);
  }, 10000);

  // Clean up on disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    clearInterval(updateInterval);
  });
}