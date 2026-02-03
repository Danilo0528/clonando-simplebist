import { authenticateUser } from '../../../lib/middleware';
import { claimFaucet, canClaimFaucet } from '../../../lib/faucet';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Use the authentication middleware
  return authenticateUser(req, res, async () => {
    try {
      // Check if user can claim faucet
      const { canClaim, timeRemaining } = await canClaimFaucet(req.user.id);
      
      if (!canClaim) {
        // Calculate time remaining in seconds
        const timeRemainingSec = Math.ceil(timeRemaining / 1000);
        return res.status(400).json({ 
          message: `Cannot claim faucet yet. Please wait ${timeRemainingSec} seconds.`,
          timeRemaining: timeRemainingSec
        });
      }

      // Claim faucet
      const result = await claimFaucet(req.user.id);
      
      res.status(200).json({ 
        message: 'Faucet claimed successfully',
        rewardAmount: result.rewardAmount,
        newBalance: result.newBalance,
        lastFaucetClaim: result.lastFaucetClaim
      });
    } catch (error) {
      console.error('Faucet claim error:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to claim faucet' 
      });
    }
  });
}