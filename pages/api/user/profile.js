import jwt from 'jsonwebtoken';
import { getUserById, getUserProfile } from '../../../lib/auth';

export default async function profileHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

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

    // Get extended user profile
    const userProfile = await getUserProfile(user.id);

    res.status(200).json({ user: userProfile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};