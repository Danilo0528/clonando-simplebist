import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { getUserById } from '../../../lib/auth';
import { getUserBalances } from '../../../lib/economy';

const prisma = new PrismaClient();

export default async function balancesHandler(req, res) {
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

    // Get user balances
    // Since getUserBalances might fail if the user doesn't have all expected fields yet,
    // we'll fetch the user directly and provide defaults
    const fullUser = await prisma.user.findUnique({
      where: { id: parseInt(user.id) },
    });

    if (!fullUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure all balance fields exist with defaults
    const responseBalances = {
      tokenBalance: fullUser.tokenBalance || fullUser.balance || 0,
      boundTokenBalance: fullUser.boundTokenBalance || 0,
      energyPoints: fullUser.energyPoints || 0,
      hashpowerVirtual: fullUser.hashpowerVirtual || 0,
      level: fullUser.level || 1,
      xp: fullUser.xp || 0,
    };

    res.status(200).json({ balances: responseBalances });
  } catch (error) {
    console.error('Error fetching user balances:', error);
    res.status(500).json({ message: 'Error fetching user balances' });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};