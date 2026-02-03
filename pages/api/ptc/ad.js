import { authenticateUser } from '../../../lib/middleware';
import { getRandomActiveAd, processPtcClick, getPtcConfig } from '../../../lib/ptc';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get a random active ad
    return authenticateUser(req, res, async () => {
      try {
        const ad = await getRandomActiveAd();
        
        if (!ad) {
          return res.status(404).json({ 
            message: 'No active ads available' 
          });
        }
        
        // Return ad info without the actual URL for security
        res.status(200).json({ 
          ad: {
            id: ad.id,
            title: ad.title,
            description: ad.description,
            reward: ad.reward,
            createdAt: ad.createdAt,
          },
          config: getPtcConfig()
        });
      } catch (error) {
        console.error('Get ad error:', error);
        res.status(500).json({ 
          message: error.message || 'Failed to get ad' 
        });
      }
    });
  } else if (req.method === 'POST') {
    // Process ad click
    return authenticateUser(req, res, async () => {
      try {
        const { adId } = req.body;

        if (!adId) {
          return res.status(400).json({ 
            message: 'Ad ID is required' 
          });
        }

        const result = await processPtcClick(req.user.id, adId);
        
        res.status(200).json({ 
          message: 'Ad clicked successfully',
          reward: result.reward,
          newBalance: result.newBalance
        });
      } catch (error) {
        console.error('Process ad click error:', error);
        res.status(500).json({ 
          message: error.message || 'Failed to process ad click' 
        });
      }
    });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}