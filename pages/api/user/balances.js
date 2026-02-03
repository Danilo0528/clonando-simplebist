import { authenticateUser } from '../../../lib/middleware';
import { getUserBalances } from '../../../lib/economy';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Use the authentication middleware
  return authenticateUser(req, res, async () => {
    try {
      const balances = await getUserBalances(req.user.id);
      
      res.status(200).json({ 
        balances 
      });
    } catch (error) {
      console.error('Get balances error:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to retrieve balances' 
      });
    }
  });
}