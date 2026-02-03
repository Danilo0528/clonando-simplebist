import { authenticateUser } from '../../../lib/middleware';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Use the authentication middleware
  return authenticateUser(req, res, async () => {
    try {
      // Return user profile without sensitive information
      const { passwordHash, ...userProfile } = req.user;
      
      res.status(200).json({ 
        user: userProfile 
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to retrieve profile' 
      });
    }
  });
}