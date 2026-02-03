import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Rate limiting configurations
const RATE_LIMIT_CONFIG = {
  faucet: { windowMs: 60 * 60 * 1000, max: 1 }, // 1 per hour
  ptc: { windowMs: 30 * 1000, max: 5 }, // 5 per 30 seconds
  shortlink: { windowMs: 60 * 1000, max: 10 }, // 10 per minute
  withdrawal: { windowMs: 24 * 60 * 60 * 1000, max: 5 }, // 5 per day
};

// IP-based rate limiting
export const checkRateLimit = async (ip, action, userId = null) => {
  const config = RATE_LIMIT_CONFIG[action];
  if (!config) {
    throw new Error(`Unknown action: ${action}`);
  }

  const windowStart = new Date(Date.now() - config.windowMs);
  
  // Count actions in the time window
  let count = 0;
  
  if (userId) {
    // If we have a user ID, check by user
    const userActions = await prisma.activityLog.count({
      where: {
        userId: parseInt(userId),
        activityType: action,
        createdAt: {
          gte: windowStart,
        },
      },
    });
    count = userActions;
  } else {
    // Otherwise, check by IP (would need to store IP in activity logs)
    // For now, we'll simulate by checking recent activity patterns
    // In a real system, we'd store IP addresses with activities
    const ipActions = await prisma.activityLog.count({
      where: {
        metadata: {
          path: ['ip'],
          equals: ip,
        },
        activityType: action,
        createdAt: {
          gte: windowStart,
        },
      },
    });
    count = ipActions;
  }

  if (count >= config.max) {
    return {
      allowed: false,
      resetTime: new Date(Date.now() + config.windowMs),
      message: `Rate limit exceeded for ${action}. Try again later.`,
    };
  }

  return { allowed: true };
};

// Suspicious activity detection
export const detectSuspiciousActivity = async (userId, activityType, metadata = {}) => {
  const now = new Date();
  const recentHours = 1; // Check last hour
  const recentStart = new Date(now.getTime() - (recentHours * 60 * 60 * 1000));

  // Check for unusual patterns
  const recentActivities = await prisma.activityLog.findMany({
    where: {
      userId: parseInt(userId),
      activityType: activityType,
      createdAt: {
        gte: recentStart,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const activityCount = recentActivities.length;
  
  // Define thresholds for suspicious activity
  let isSuspicious = false;
  let reason = '';

  switch (activityType) {
    case 'faucet':
      // More than 2 faucet claims per hour is suspicious
      if (activityCount > 2) {
        isSuspicious = true;
        reason = 'Too many faucet claims in a short period';
      }
      break;
    case 'ptc':
      // More than 50 PTC clicks per hour is suspicious
      if (activityCount > 50) {
        isSuspicious = true;
        reason = 'Unusually high PTC activity';
      }
      break;
    case 'shortlink':
      // More than 100 shortlink visits per hour is suspicious
      if (activityCount > 100) {
        isSuspicious = true;
        reason = 'Unusually high shortlink activity';
      }
      break;
    case 'mining':
      // More than 100 mining actions per hour is suspicious
      if (activityCount > 100) {
        isSuspicious = true;
        reason = 'Unusually high mining activity';
      }
      break;
    default:
      // General threshold for other activities
      if (activityCount > 50) {
        isSuspicious = true;
        reason = 'Unusually high activity for this action type';
      }
  }

  // Check for rapid successive activities
  if (recentActivities.length >= 2) {
    const timeDiff = recentActivities[0].createdAt - recentActivities[1].createdAt;
    if (timeDiff < 1000) { // Less than 1 second between activities
      isSuspicious = true;
      reason = 'Activities happening too rapidly';
    }
  }

  if (isSuspicious) {
    // Log the suspicious activity
    await prisma.suspiciousActivity.create({
      data: {
        userId: parseInt(userId),
        activityType,
        reason,
        metadata,
        detectedAt: new Date(),
      },
    });
  }

  return { isSuspicious, reason };
};

// User reputation system
export const getUserReputation = async (userId) => {
  // Calculate reputation based on various factors
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    include: {
      suspiciousActivities: {
        orderBy: { detectedAt: 'desc' },
        take: 10, // Last 10 suspicious activities
      },
      activityLogs: {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        take: 100, // Sample of recent activities
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Calculate reputation score (0-100, where 100 is highest trust)
  let reputationScore = 100;

  // Deduct points for suspicious activities
  const recentSuspiciousCount = user.suspiciousActivities.filter(sa => {
    const daysAgo = (Date.now() - sa.detectedAt.getTime()) / (1000 * 60 * 60 * 24);
    // More recent violations affect score more
    return daysAgo < 30;
  }).length;

  reputationScore -= recentSuspiciousCount * 10; // 10 points per recent violation

  // Deduct points if user is newly registered
  const accountAgeDays = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (accountAgeDays < 7) { // Less than 1 week old
    reputationScore -= 10;
  }

  // Ensure score is between 0 and 100
  reputationScore = Math.max(0, Math.min(100, reputationScore));

  return {
    score: reputationScore,
    level: reputationScore > 80 ? 'Trusted' : 
           reputationScore > 60 ? 'Standard' : 
           reputationScore > 30 ? 'Caution' : 'High Risk',
    suspiciousActivityCount: recentSuspiciousCount,
    accountAgeDays: Math.floor(accountAgeDays),
  };
};

// Enhanced authentication security
export const hashPasswordSecure = async (password) => {
  // Use bcrypt with higher rounds for better security
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Check if a user should be temporarily locked due to suspicious activity
export const checkUserLockStatus = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      id: true,
      email: true,
      lockedUntil: true,
      failedAttempts: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if account is locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return {
      isLocked: true,
      lockedUntil: user.lockedUntil,
      reason: 'Account temporarily locked for security reasons',
    };
  }

  return { isLocked: false };
};

// Log security events
export const logSecurityEvent = async (userId, eventType, details, severity = 'info') => {
  await prisma.securityLog.create({
    data: {
      userId: parseInt(userId),
      eventType,
      details,
      severity,
      ipAddress: details.ip || null,
      userAgent: details.userAgent || null,
    },
  });
};

// Validate input to prevent injection attacks
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove potentially dangerous characters
  return input
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Check for valid IP address
export const isValidIp = (ip) => {
  // Basic IPv4 validation
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  // Basic IPv6 validation
  const ipv6Regex = /^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^::1$|^::$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

// Security configuration
export const getSecurityConfig = () => {
  return {
    rateLimits: RATE_LIMIT_CONFIG,
    passwordRequirements: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    accountLockThreshold: 5, // Failed attempts before lock
    lockDuration: 30 * 60 * 1000, // 30 minutes
    description: 'Security measures to protect against fraud and abuse',
  };
};