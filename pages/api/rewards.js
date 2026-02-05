import jwt from 'jsonwebtoken';

// This is a mock database. In a real application, you'd use a real database.
const users = {
  testuser: {
    lastDailyReward: null,
    balance: 1000,
  },
};

const JWT_SECRET = 'your-super-secret-key-that-is-at-least-32-chars-long';
const REWARD_AMOUNT = 100; // The amount of currency to award
const COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export default async function handler(req, res) {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  let user;
  try {
    const token = authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    user = users[decoded.username];
    if (!user) {
      throw new Error('User not found');
    }
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const now = Date.now();
  const lastClaimed = user.lastDailyReward;
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
      user.lastDailyReward = now;
      user.balance += REWARD_AMOUNT;
      res.status(200).json({ 
        message: `You've claimed your ${REWARD_AMOUNT} Bits reward!`,
        newBalance: user.balance,
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
