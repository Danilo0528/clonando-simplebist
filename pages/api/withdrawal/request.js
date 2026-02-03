import { authenticateUser } from '../../../lib/middleware';
import { createWithdrawal, getUserWithdrawalHistory, getWithdrawalConfig } from '../../../lib/withdrawal';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Create a new withdrawal request
    return authenticateUser(req, res, async () => {
      try {
        const { amount, crypto, address } = req.body;

        if (!amount || amount <= 0) {
          return res.status(400).json({ 
            message: 'Amount is required and must be greater than 0' 
          });
        }

        if (!crypto) {
          return res.status(400).json({ 
            message: 'Cryptocurrency is required' 
          });
        }

        if (!address) {
          return res.status(400).json({ 
            message: 'Address is required' 
          });
        }

        const result = await createWithdrawal(req.user.id, amount, crypto, address);
        
        res.status(201).json({ 
          message: 'Withdrawal request created successfully',
          withdrawal: result.withdrawal,
          fee: result.fee,
          netAmount: result.netAmount,
        });
      } catch (error) {
        console.error('Create withdrawal error:', error);
        res.status(500).json({ 
          message: error.message || 'Failed to create withdrawal request' 
        });
      }
    });
  } else if (req.method === 'GET') {
    // Get user's withdrawal history
    return authenticateUser(req, res, async () => {
      try {
        const { limit = 10, offset = 0 } = req.query;
        
        const history = await getUserWithdrawalHistory(
          req.user.id, 
          parseInt(limit), 
          parseInt(offset)
        );
        
        res.status(200).json({ 
          history,
          config: getWithdrawalConfig()
        });
      } catch (error) {
        console.error('Get withdrawal history error:', error);
        res.status(500).json({ 
          message: error.message || 'Failed to get withdrawal history' 
        });
      }
    });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}