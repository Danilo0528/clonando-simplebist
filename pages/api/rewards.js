import prisma from '../../lib/prisma.mjs';
import { getUserFromRequest } from '../../lib/auth';

const REWARD_AMOUNT = 100; // The amount of currency to award
const COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export default async function handler(req, res) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const now = Date.now();

  // Use lastFaucetClaim or createdAt as fallback for lastDailyReward
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const lastClaimed = dbUser.lastFaucetClaim ? new Date(dbUser.lastFaucetClaim).getTime() : null;
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
        where: { id: user.id },
        data: {
          tokenBalance: { increment: REWARD_AMOUNT },
          lastFaucetClaim: new Date(),
        },
      });

      res.status(200).json({
        message: `You've claimed your ${REWARD_AMOUNT} Bits reward!`,
        newTokenBalance: updatedUser.tokenBalance,
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
