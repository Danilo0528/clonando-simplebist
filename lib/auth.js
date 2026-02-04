import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Get current user (mocked)
export const getCurrentUser = async () => {
    // In a real application, you would get the user ID from the session or token
    const userId = 1; // Mocked user ID
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (error) {
        console.error('Error fetching current user:', error);
        // Return a default user object or handle the error as needed
        return {
            username: 'Guest',
        };
    }
};


// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Get user from token
export const getUserFromToken = async (token) => {
  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.userId) },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      balance: user.balance,
      createdAt: user.createdAt,
      level: user.level,
      xp: user.xp,
      energyPoints: user.energyPoints,
    };
  } catch (error) {
    console.error('Error getting user from token:', error);
    throw new Error('Error getting user from token');
  }
};

// Update user
export const updateUser = async (userId, data) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data,
    });

    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Error updating user');
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    return user;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw new Error('Error fetching user');
  }
};

// Get user by ID with profile info
export const getUserProfile = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Return user data with default values for missing fields
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      balance: user.balance,
      createdAt: user.createdAt,
      level: user.level,
      xp: user.xp,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Error fetching user profile');
  }
};