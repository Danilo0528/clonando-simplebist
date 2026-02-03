import { getEconomyStats, getEconomyConfig } from '../../../lib/economy';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const stats = await getEconomyStats();
      const config = getEconomyConfig();
      
      res.status(200).json({ 
        stats,
        config
      });
    } catch (error) {
      console.error('Get economy stats error:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to get economy stats' 
      });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}