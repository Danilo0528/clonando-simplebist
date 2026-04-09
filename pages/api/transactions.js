import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export default async function handler(req, res) {
  const { authorization } = req.headers;
  
  if (!authorization) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  let userId;
  try {
    const token = authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
    
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // For now, return an empty array since we don't have a Transaction model
  // In production, you would have a Transaction model and query it here
  if (req.method === 'GET') {
    res.status(200).json([]);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
  