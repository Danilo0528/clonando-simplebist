import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

// Hash password
export const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Verify password
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Register new user
export const registerUser = async ({ username, email, password }) => {
  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email },
      ],
    },
  });

  if (existingUser) {
    throw new Error('Username or email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash: hashedPassword,
    },
  });

  // Generate token
  const token = generateToken(user.id);

  return { user, token };
};

// Login user
export const loginUser = async ({ username, password }) => {
  // Find user by username or email
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email: username },
      ],
    },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user.passwordHash);

  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  // Generate token
  const token = generateToken(user.id);

  return { user, token };
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });
};