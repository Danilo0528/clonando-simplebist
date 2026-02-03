import { authenticateUser } from '../../../lib/middleware';
import { getAvailableOfferwalls, getUserOfferwallHistory, processCompletedOffer, validateOfferwallCallback, getOfferwallConfig } from '../../../lib/offerwalls';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get available offerwalls and user history (requires authentication)
    return authenticateUser(req, res, async () => {
      try {
        const offerwalls = await getAvailableOfferwalls();
        const history = await getUserOfferwallHistory(req.user.id);
        const config = getOfferwallConfig();
        
        res.status(200).json({ 
          offerwalls,
          history,
          config
        });
      } catch (error) {
        console.error('Get offerwalls error:', error);
        res.status(500).json({ 
          message: error.message || 'Failed to get offerwalls' 
        });
      }
    });
  } else if (req.method === 'POST') {
    // Handle offerwall completion callback (public endpoint for webhook)
    try {
      const { providerId, payload } = req.body;

      if (!providerId || !payload) {
        return res.status(400).json({ 
          message: 'Provider ID and payload are required' 
        });
      }

      // Validate the callback
      const validation = await validateOfferwallCallback(providerId, payload);
      
      if (!validation.valid) {
        return res.status(400).json({ 
          message: `Invalid callback: ${validation.error}` 
        });
      }

      // In a real implementation, you would process the offer completion here
      // For this demo, we'll just return a success response
      // The actual reward would be processed after validating the callback

      res.status(200).json({ 
        message: 'Callback received and validated',
        provider: providerId,
        offerId: payload.oid || payload.offerid || payload.click_transaction_id || payload.transaction_id,
        validated: true
      });
    } catch (error) {
      console.error('Offerwall callback error:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to process offerwall callback' 
      });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}