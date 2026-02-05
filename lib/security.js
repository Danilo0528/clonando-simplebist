import prisma from './prisma';

// Security configuration constants
export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes in milliseconds
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIREMENTS: {
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: false
  }
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  faucet: { windowMs: 60 * 60 * 1000, max: 1 }, // 1 per hour
  ptc: { windowMs: 30 * 1000, max: 5 }, // 5 per 30 seconds
  shortlink: { windowMs: 60 * 1000, max: 10 }, // 10 per minute
  withdrawal: { windowMs: 24 * 60 * 60 * 1000, max: 3 } // 3 per day
};

// Function to check if user account is locked
export const isAccountLocked = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        failedLoginAttempts: true,
        lockoutExpiresAt: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if there's a lockout expiration and if it's still valid
    if (user.lockoutExpiresAt && new Date() < user.lockoutExpiresAt) {
      return true;
    }

    // If there's a lockout date that has expired, reset the attempts
    if (user.lockoutExpiresAt && new Date() >= user.lockoutExpiresAt) {
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          failedLoginAttempts: 0,
          lockoutExpiresAt: null
        }
      });
      return false;
    }

    return false;
  } catch (error) {
    console.error('Error checking account lock status:', error);
    throw error;
  }
};

// Function to record a failed login attempt
export const recordFailedLoginAttempt = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        failedLoginAttempts: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    let lockoutExpiresAt = null;
    const newFailedAttempts = user.failedLoginAttempts + 1;

    // Check if we need to lock the account
    if (newFailedAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      lockoutExpiresAt = new Date(Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION);
    }

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        failedLoginAttempts: newFailedAttempts,
        lockoutExpiresAt: lockoutExpiresAt
      }
    });

    return {
      attempts: newFailedAttempts,
      isLocked: !!lockoutExpiresAt
    };
  } catch (error) {
    console.error('Error recording failed login attempt:', error);
    throw error;
  }
};

// Function to reset login attempts after successful login
export const resetLoginAttempts = async (userId) => {
  try {
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        failedLoginAttempts: 0,
        lockoutExpiresAt: null
      }
    });
  } catch (error) {
    console.error('Error resetting login attempts:', error);
    throw error;
  }
};

// Function to check for suspicious activity
export const checkForSuspiciousActivity = async (userId, activityType, activityData = {}) => {
  try {
    // In a real implementation, this would check various metrics to identify suspicious behavior
    // For now, we'll just check some basic heuristics
    
    let isSuspicious = false;
    let reason = '';

    // Check recent activity of this type
    // Note: We're skipping this check since ActivityLog model doesn't exist in schema
    // In a production environment, you would either create the ActivityLog model in schema.prisma
    // or use an alternative logging mechanism

    switch (activityType) {
      case 'faucet':
        // More than 2 faucet claims per hour is suspicious (normal is 1 per hour)
        // Since we can't check ActivityLog, we'll skip this check
        break;
      case 'ptc':
        // Very rapid completion of PTC tasks could be suspicious
        // We'd normally check timestamps between completions
        break;
      case 'withdrawal':
        // Multiple withdrawal attempts in a short time could be suspicious
        break;
      default:
        break;
    }

    // Additional checks could include IP analysis, device fingerprinting, etc.
    // These would require additional data storage not currently available in the schema

    return {
      isSuspicious,
      reason,
      userId,
      activityType,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error checking for suspicious activity:', error);
    throw error;
  }
};

// Function to validate password strength
export const validatePasswordStrength = (password) => {
  const config = SECURITY_CONFIG.PASSWORD_REQUIREMENTS;
  
  const checks = {
    length: password.length >= SECURITY_CONFIG.PASSWORD_MIN_LENGTH,
    lowercase: !config.lowercase || /[a-z]/.test(password),
    uppercase: !config.uppercase || /[A-Z]/.test(password),
    numbers: !config.numbers || /\d/.test(password),
    symbols: !config.symbols || /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const isValid = Object.values(checks).every(check => check);
  
  return {
    isValid,
    checks,
    strength: calculatePasswordStrength(password)
  };
};

// Helper function to calculate password strength
const calculatePasswordStrength = (password) => {
  let score = 0;
  
  // Length
  score += Math.min(password.length / 4, 1);
  
  // Character variety
  if (/[a-z]/.test(password)) score += 0.25;
  if (/[A-Z]/.test(password)) score += 0.25;
  if (/\d/.test(password)) score += 0.25;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 0.25;
  
  // Bonus for mixing different types
  const categories = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  ].filter(Boolean).length;
  
  score += (categories - 1) * 0.1;
  
  // Cap at 1.0
  return Math.min(score, 1.0);
};

// Function to generate security report for admin
export const generateSecurityReport = async (daysBack = 7) => {
  try {
    // In a real implementation, this would aggregate security-related data
    // Since we don't have ActivityLog model, we'll return placeholder data
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    
    // Placeholder data since we can't access ActivityLog
    const report = {
      periodDays: daysBack,
      startDate: cutoffDate,
      endDate: new Date(),
      totalUsers: await prisma.user.count(),
      activeUsers: await prisma.user.count({
        where: {
          updatedAt: {
            gte: cutoffDate
          }
        }
      }),
      // These would normally come from ActivityLog
      suspiciousActivities: 0, 
      blockedAccounts: 0,
      securityIncidents: 0,
      recommendations: [
        "Consider implementing ActivityLog model for better security monitoring",
        "Implement rate limiting for API endpoints",
        "Add IP tracking for suspicious activity detection"
      ]
    };

    return report;
  } catch (error) {
    console.error('Error generating security report:', error);
    throw error;
  }
};