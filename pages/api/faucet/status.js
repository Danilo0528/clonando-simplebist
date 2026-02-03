import { authenticateUser } from '../../../lib/middleware';
import { canClaimFaucet, getLastFaucetClaim, getFaucetConfig } from '../../../lib/faucet';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Use the authentication middleware
  return authenticateUser(req, res, async () => {
    try {
      const { canClaim, timeRemaining } = await canClaimFaucet(req.user.id);
      const lastClaim = await getLastFaucetClaim(req.user.id);
      const config = getFaucetConfig();
      
      res.status(200).json({ 
        canClaim,
        timeRemaining: Math.ceil(timeRemaining / 1000), // Convert to seconds
        lastClaim,
        config
      });
    } catch (error) {
      console.error('Faucet status error:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to get faucet status' 
      });
    }
  });
}