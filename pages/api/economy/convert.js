import { authenticateUser } from '../../../lib/middleware';
import { convertTokens, getEconomyConfig } from '../../../lib/economy';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Convert tokens
    return authenticateUser(req, res, async () => {
      try {
        const { amount, fromType, toType } = req.body;

        if (!amount || amount <= 0) {
          return res.status(400).json({ 
            message: 'Amount is required and must be greater than 0' 
          });
        }

        if (!fromType || !toType) {
          return res.status(400).json({ 
            message: 'Both fromType and toType are required' 
          });
        }

        if (amount < getEconomyConfig().minConversionAmount) {
          return res.status(400).json({ 
            message: `Minimum conversion amount is ${getEconomyConfig().minConversionAmount}` 
          });
        }

        const result = await convertTokens(req.user.id, amount, fromType, toType);
        
        res.status(200).json({ 
          message: `Successfully converted ${amount} ${fromType} tokens to ${toType} tokens`,
          newBalances: {
            tokenBalance: result.tokenBalance,
            boundTokenBalance: result.boundTokenBalance,
          }
        });
      } catch (error) {
        console.error('Token conversion error:', error);
        res.status(500).json({ 
          message: error.message || 'Failed to convert tokens' 
        });
      }
    });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}