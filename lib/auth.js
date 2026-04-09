import prisma from './prisma';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { getXpProgressToNextLevel } from './progression'; // Import the new function

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// --- CORE AUTH FUNCTIONS for PAGES ROUTER ---

export const getExpForLevel = (level) => {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level - 1, 1.5));
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const getUserFromToken = async (token) => {
  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: parseInt(decoded.userId) } });

    if (!user) return null;

    // Calculate level progression details using the new function
    const progression = getXpProgressToNextLevel(user.xp);

    // Calculate max energy based on level (100 + level * 10)
    const maxEnergy = 100 + (progression.currentLevel * 10);

    // Calculate current energy considering regeneration (8 points every 5 minutes)
    const lastEnergyUpdate = user.lastEnergyUpdate || user.updatedAt;
    const now = new Date();
    const timeDiff = now - new Date(lastEnergyUpdate); // in milliseconds
    
    // Convert to minutes to calculate regeneration
    const minutesPassed = timeDiff / (1000 * 60);
    
    // Calculate how many 5-minute cycles have passed
    const fiveMinuteCycles = Math.floor(minutesPassed / 5);
    
    // Calculate regenerated energy (8 points every 5 minutes)
    const energyRegenerated = fiveMinuteCycles * 8;
    
    // Calculate current energy (don't exceed max energy)
    const currentEnergy = Math.min(
      user.energyPoints + energyRegenerated, 
      maxEnergy
    );

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      balance: user.balance,
      createdAt: user.createdAt,
      level: progression.currentLevel, // Use the calculated level
      xp: user.xp,
      energyPoints: currentEnergy, // Current energy after regeneration
      expForNextLevel: progression.xpNeededForNextLevel, // Use the calculated XP needed for next level
      progressPercentage: progression.progressPercentage, // Use the calculated progress percentage
      maxEnergy: maxEnergy, // Add max energy to the user object
      energyRegenerationRate: 8, // 8 points every 5 minutes
      lastEnergyUpdate: user.lastEnergyUpdate || user.updatedAt
    };
  } catch (error) {
    console.error('Error getting user from token:', error.message);
    return null;
  }
};

// Extract user from request object (works for both API routes and middleware)
export const getUserFromRequest = async (req) => {
  try {
    // Try to get token from Authorization header first
    let token = null;
    const authHeader = req.headers?.authorization || req.headers?.Authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // If no token in header, try to get from cookies
    if (!token) {
      const cookieHeader = req.headers?.cookie;
      if (cookieHeader) {
        const cookies = cookie.parse(cookieHeader);
        token = cookies.token || cookies.authToken;
      }
    }

    if (!token) {
      return null;
    }

    return await getUserFromToken(token);
  } catch (error) {
    console.error('Error extracting user from request:', error.message);
    return null;
  }
};

// Generate JWT token for a user
export const generateToken = (user) => {
  const payload = {
    userId: user.id,
    username: user.username,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // Token expires in 7 days
  };

  return jwt.sign(payload, JWT_SECRET);
};

// Create session for a user (returns token)
export const createSession = async (user) => {
  // Here you might want to store session data in a database
  // For now, we'll just return a JWT token
  return generateToken(user);
};

// Destroy session for a user (invalidate token)
export const destroySession = async (req) => {
  // In a real application, you might want to blacklist the token or remove session from DB
  // For now, we'll just not return anything
  return true;
};

// Hash password (you might want to use bcrypt or similar)
export const hashPassword = async (password) => {
  // Placeholder - in production, use bcrypt or similar
  // For now, returning the password as-is (not recommended for production!)
  return password;
};

// Verify password (you might want to use bcrypt or similar)
export const verifyPassword = async (password, hashedPassword) => {
  // Placeholder - in production, use bcrypt.compare or similar
  // For now, comparing directly (not recommended for production!)
  return password === hashedPassword;
};

// Update user data in database
export const updateUser = async (userId, data) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: data,
    });
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};
