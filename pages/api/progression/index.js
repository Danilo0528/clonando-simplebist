import { authenticateUser } from '../../../lib/middleware';
import { getUserProgression, getLeaderboard } from '../../../lib/progression';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get user's progression stats
    return authenticateUser(req, res, async () => {
      try {
        const progression = await getUserProgression(req.user.id);
        
        res.status(200).json({ 
          progression
        });
      } catch (error) {
        console.error('Get progression error:', error);
        res.status(500).json({ 
          message: error.message || 'Failed to get progression stats' 
        });
      }
    });
  } else if (req.method === 'POST') {
    // Get leaderboard
    try {
      const { limit = 10 } = req.body;
      const leaderboard = await getLeaderboard(limit);
      
      res.status(200).json({ 
        leaderboard
      });
    } catch (error) {
      console.error('Get leaderboard error:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to get leaderboard' 
      });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}