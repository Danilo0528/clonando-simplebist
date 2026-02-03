import { authenticateUser } from '../../../../lib/middleware';
import { getShortlinkByCode, processShortlinkVisit } from '../../../../lib/shortlinks';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: 'Shortlink code is required' });
  }

  // Use the authentication middleware
  return authenticateUser(req, res, async () => {
    try {
      // Process the shortlink visit
      const result = await processShortlinkVisit(code, req.user.id);
      
      res.status(200).json({ 
        message: 'Shortlink visited successfully',
        reward: result.reward,
        newBalance: result.newBalance
      });
    } catch (error) {
      console.error('Process shortlink visit error:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to process shortlink visit' 
      });
    }
  });
}