import prisma from './prisma.mjs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookie from 'cookie';
import { getXpProgressToNextLevel } from './progression'; 
import { calculateCurrentEnergy } from './energy.mjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// --- ADDED FUNCTIONS ---
export const getUserById = async (userId) => {
  return await prisma.user.findUnique({ where: { id: parseInt(userId) } });
};
// -----------------------

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

    // Calculate energy using the centralized module
    const energyData = calculateCurrentEnergy(user);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      tokenBalance: user.tokenBalance,
      boundTokenBalance: user.boundTokenBalance,
      createdAt: user.createdAt,
      level: progression.currentLevel, 
      xp: user.xp,
      energyPoints: energyData.current, 
      expForNextLevel: progression.xpNeededForNextLevel,
      progressPercentage: progression.progressPercentage,
      maxEnergy: energyData.max,
      energyRegenerationRate: 8,
      lastEnergyUpdate: energyData.lastUpdate
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

export const generateToken = (user) => {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
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

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
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
