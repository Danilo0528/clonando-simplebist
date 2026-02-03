import { authenticateUser } from '../../../lib/middleware';
import { upgradeHashpower } from '../../../lib/mining';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Upgrade user's hashpower
    return authenticateUser(req, res, async () => {
      try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
          return res.status(400).json({ 
            message: 'Amount is required and must be greater than 0' 
          });
        }

        const result = await upgradeHashpower(req.user.id, amount);
        
        res.status(200).json({ 
          message: 'Hashpower upgraded successfully',
          ...result
        });
      } catch (error) {
        console.error('Upgrade hashpower error:', error);
        res.status(500).json({ 
          message: error.message || 'Failed to upgrade hashpower' 
        });
      }
    });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}