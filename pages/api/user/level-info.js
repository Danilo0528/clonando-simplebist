import jwt from 'jsonwebtoken';
import { getUserById } from '../../../lib/auth';
import { getUserLevelInfo } from '../../../lib/progression';

export default async function levelInfoHandler(req, res) {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');

    // Get user by ID
    const user = await getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (req.method === 'GET') {
      // Get user's level and multiplier info
      const levelInfo = await getUserLevelInfo(user.id);
      
      res.status(200).json({ levelInfo });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in level info API:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};