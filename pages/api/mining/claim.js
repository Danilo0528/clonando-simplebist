import { authenticateUser } from '../../../lib/middleware';
import { claimMiningRewards } from '../../../lib/mining';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Claim mining rewards from completed pools
    return authenticateUser(req, res, async () => {
      try {
        const result = await claimMiningRewards(req.user.id);
        
        if (result.claimed > 0) {
          res.status(200).json({ 
            message: `Successfully claimed ${result.claimed} tokens in mining rewards`,
            ...result
          });
        } else {
          res.status(200).json({ 
            message: 'No mining rewards available to claim',
            ...result
          });
        }
      } catch (error) {
        console.error('Claim mining rewards error:', error);
        res.status(500).json({ 
          message: error.message || 'Failed to claim mining rewards' 
        });
      }
    });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}