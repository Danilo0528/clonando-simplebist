import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const REWARD_AMOUNT = 100; // The amount of currency to award
const COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

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

  const now = Date.now();
  
  // Get user with lastDailyReward field
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });
  
  // Use lastFaucetClaim or createdAt as fallback for lastDailyReward
  const lastClaimed = user.lastFaucetClaim ? new Date(user.lastFaucetClaim).getTime() : null;
  const canClaim = !lastClaimed || (now - lastClaimed > COOLDOWN);

  if (req.method === 'GET') {
    if (canClaim) {
      res.status(200).json({ canClaim: true, timeLeft: 0 });
    } else {
      const timeLeft = Math.max(0, COOLDOWN - (now - lastClaimed));
      res.status(200).json({ canClaim: false, timeLeft });
    }
  } else if (req.method === 'POST') {
    if (canClaim) {
      // Update user with new balance and last claim time
      const updatedUser = await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          balance: user.balance + REWARD_AMOUNT,
          lastFaucetClaim: new Date(),
        },
      });
      
      res.status(200).json({
        message: `You've claimed your ${REWARD_AMOUNT} Bits reward!`,
        newBalance: updatedUser.balance,
        nextClaimTime: now + COOLDOWN,
      });
    } else {
      res.status(400).json({ message: 'You have already claimed your daily reward.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
