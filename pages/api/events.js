import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    // If userId is provided, filter events for that user
    // Otherwise, return all events
    let events;
    if (userId) {
      // In a real implementation, we would fetch from an Events table
      // Since that model doesn't exist in schema, we'll return simulated data
      
      // Simulate user-specific events
      events = [
        { id: 1, userId: parseInt(userId), type: 'EARNED', amount: 5.25, description: 'Completed an offerwall', timestamp: new Date(Date.now() - 3600000) },
        { id: 2, userId: parseInt(userId), type: 'EARNED', amount: 3.80, description: 'Claimed from faucet', timestamp: new Date(Date.now() - 7200000) },
        { id: 3, userId: parseInt(userId), type: 'EARNED', amount: 10.10, description: 'Completed a PTC ad', timestamp: new Date(Date.now() - 10800000) },
      ];
    } else {
      // Simulate general events
      events = [
        { userId: 1, type: 'EARNED', amount: 5.25, description: 'Completed an offerwall' },
        { userId: 2, type: 'EARNED', amount: 3.80, description: 'Claimed from faucet' },
        { userId: 3, type: 'EARNED', amount: 10.10, description: 'Completed a PTC ad' },
        { userId: 4, type: 'EARNED', amount: 2.50, description: 'Completed an offerwall' },
        { userId: 5, type: 'EARNED', amount: 1.00, description: 'Claimed from faucet' },
        { userId: 6, type: 'EARNED', amount: 15.00, description: 'Completed a shortlink' },
      ];
    }

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
}
