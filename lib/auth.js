import prisma from './prisma.mjs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookie from 'cookie';
import { createServerClient } from '@supabase/ssr';
import { getXpProgressToNextLevel } from './progression'; 
import { calculateCurrentEnergy } from './energy.mjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// --- ADDED FUNCTIONS ---
export const getUserById = async (userId) => {
  return await prisma.user.findUnique({ where: { id: userId } });
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

export const getProfileFromDbUser = (user) => {
  if (!user) return null;

  const progression = getXpProgressToNextLevel(user.xp);
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
    lastEnergyUpdate: energyData.lastUpdate,
    isAdmin: user.isAdmin,
    isActive: user.isActive,
  };
};

export const getUserFromToken = async (token) => {
  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) return null;

    return getProfileFromDbUser(user);
  } catch (error) {
    console.error('Error getting user from token:', error.message);
    return null;
  }
};

const getHeader = (req, name) => {
  const headers = req?.headers;
  if (!headers) return undefined;
  if (typeof headers.get === 'function') return headers.get(name);
  return headers[name] || headers[name.toLowerCase()];
};

const getReadOnlySupabaseClient = (req) => {
  const cookieHeader = getHeader(req, 'cookie') || '';
  const parsedCookies = cookie.parse(cookieHeader);
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return Object.entries(parsedCookies).map(([name, value]) => ({ name, value }));
        },
        setAll() {},
      },
    },
  );
};

export const getSupabaseUserFromRequest = async (req) => {
  try {
    const supabase = getReadOnlySupabaseClient(req);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch (error) {
    console.error('Error getting supabase user from request:', error.message);
    return null;
  }
};

export const findOrCreateUserBySupabaseId = async (supabaseUser) => {
  let dbUser = await prisma.user.findUnique({ where: { id: supabaseUser.id } });
  if (dbUser) return dbUser;

  const username = supabaseUser.user_metadata?.username
    || supabaseUser.email?.split('@')[0]
    || 'user';

  dbUser = await prisma.user.findUnique({ where: { email: supabaseUser.email } });
  if (dbUser) return dbUser;

  return prisma.user.create({
    data: {
      id: supabaseUser.id,
      email: supabaseUser.email,
      username,
    },
  });
};

// Extract user from request object (works for both API routes and middleware)
export const getUserFromRequest = async (req) => {
  try {
    // Try to get token from Authorization header first
    let token = null;
    const authHeader = getHeader(req, 'authorization') || getHeader(req, 'Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // If no token in header, try to get from cookies
    if (!token) {
      const cookieHeader = getHeader(req, 'cookie');
      if (cookieHeader) {
        const cookies = cookie.parse(cookieHeader);
        token = cookies.token || cookies.authToken;
      }
    }

    // 1. Custom JWT path (Bearer header / token cookie)
    if (token) {
      const user = await getUserFromToken(token);
      if (user) return user;
    }

    // 2. Fallback: resolve the Supabase session and provision the user in Prisma
    const supabaseUser = await getSupabaseUserFromRequest(req);
    if (!supabaseUser) return null;

    const dbUser = await findOrCreateUserBySupabaseId(supabaseUser);
    return getProfileFromDbUser(dbUser);
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
      where: { id: userId },
      data: data,
    });
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};
