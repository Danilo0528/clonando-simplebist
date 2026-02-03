import { authenticateUser } from '../../../lib/middleware';
import { performMiningAction, getMiningStats, claimMiningRewards, upgradeHashpower } from '../../../lib/mining';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Perform mining action (contribute hashpower to pool)
    return authenticateUser(req, res, async () => {
      try {
        const result = await performMiningAction(req.user.id);
        
        res.status(200).json({ 
          message: 'Mining action performed successfully',
          ...result
        });
      } catch (error) {
        console.error('Mining action error:', error);
        res.status(500).json({ 
          message: error.message || 'Failed to perform mining action' 
        });
      }
    });
  } else if (req.method === 'GET') {
    // Get mining statistics
    return authenticateUser(req, res, async () => {
      try {
        const stats = await getMiningStats(req.user.id);
        
        res.status(200).json({ 
          stats
        });
      } catch (error) {
        console.error('Get mining stats error:', error);
        res.status(500).json({ 
          message: error.message || 'Failed to get mining stats' 
        });
      }
    });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}