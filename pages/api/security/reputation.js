import { authenticateUser } from '../../../lib/middleware';
import { getUserReputation, getSecurityConfig } from '../../../lib/security';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get user's reputation score
    return authenticateUser(req, res, async () => {
      try {
        const reputation = await getUserReputation(req.user.id);
        const config = getSecurityConfig();
        
        res.status(200).json({ 
          reputation,
          config
        });
      } catch (error) {
        console.error('Get reputation error:', error);
        res.status(500).json({ 
          message: error.message || 'Failed to get reputation' 
        });
      }
    });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}