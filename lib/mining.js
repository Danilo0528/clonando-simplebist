import prisma from './prisma.mjs';
import { grantActivityXp, getLevelFromXp, awardXp, getLevelMultiplier } from './progression';
import { syncUserEnergy } from './energy.mjs';
import { creditTokens } from './economy.js';

// ✅ NUEVO: Calcular recompensa acumulada de minería basada en inventario y timestamps
export const calculateAccumulatedMiningReward = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      lastMiningClaim: true,
      level: true,
      createdAt: true,
      inventory: true, // Incluir inventario para calcular bonus dinámicos
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // ✅ Calcular Hashrate y Multiplicador de Software dinámicamente
  let totalHashrate = 0;
  let softwareMultiplier = 1.0;

  user.inventory.forEach(item => {
    if (item.itemType === 'hardware') {
      totalHashrate += item.hashrate * item.quantity;
    } else if (item.itemType === 'consumable') {
      // Ejemplo: cada consumible da 5% de bonus
      softwareMultiplier += (0.05 * item.quantity);
    }
  });

  if (totalHashrate <= 0) {
    return {
      accumulatedReward: 0,
      timeSinceLastClaim: 0,
      canClaim: false,
      hashrate: 0,
    };
  }

  const now = new Date();
  const lastClaimDate = user.lastMiningClaim || user.createdAt;
  const timeDiffSeconds = Math.floor((now - lastClaimDate) / 1000);
  
  // Tasa base: 0.001 tokens por hashpower por minuto
  const baseRatePerMinute = 0.001;
  const levelBonus = getLevelMultiplier(user.level);
  
  const minutesPassed = timeDiffSeconds / 60;
  
  // Fórmula: (Hashrate * Tasa * Minutos * Bonus de Nivel * Multiplicador de Software)
  const accumulatedReward = totalHashrate * baseRatePerMinute * minutesPassed * levelBonus * softwareMultiplier;

  return {
    accumulatedReward,
    timeSinceLastClaim: timeDiffSeconds * 1000,
    minutesPassed,
    canClaim: timeDiffSeconds >= 60,
    hashrate: totalHashrate,
    levelBonus,
    softwareMultiplier,
  };
};

// Get mining status for a user
export const getUserMiningStatus = async (userId) => {
  try {
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }
    
    // Sincronizar energía
    user = await syncUserEnergy(user);

    // ✅ Usar lógica de timestamps para calcular recompensa acumulada
    const accumulatedReward = await calculateAccumulatedMiningReward(userId);

    return {
      userId: user.id,
      status: accumulatedReward.hashrate > 0 ? 'active' : 'inactive',
      hashpower: accumulatedReward.hashrate,
      energy: user.energyPoints,
      potentialReward: accumulatedReward.accumulatedReward,
      timeWindow: 60 * 60 * 1000, // 1 hour in milliseconds
      level: user.level,
      xp: user.xp,
      // ✅ Nueva información de timestamps
      accumulatedReward: accumulatedReward.accumulatedReward,
      minutesPassed: accumulatedReward.minutesPassed || 0,
      canClaimMining: accumulatedReward.canClaim,
      levelBonus: accumulatedReward.levelBonus || 1,
    };
  } catch (error) {
    console.error('Error getting user mining status:', error);
    throw error;
  }
};

// Start mining session
export const startMiningSession = async (userId) => {
  try {
    // In this simplified version, we just verify the user can mine
    // More complex implementations would track sessions in a separate table
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        hashpowerVirtual: true,
        energyPoints: true
      }
    });

    if (!user || user.hashpowerVirtual <= 0) {
      throw new Error('User has no virtual hashpower to mine');
    }

    return {
      success: true,
      message: 'Mining session started',
      userId: user.id,
      hashpower: user.hashpowerVirtual
    };
  } catch (error) {
    console.error('Error starting mining session:', error);
    throw error;
  }
};

// Claim mining rewards
export const claimMiningRewards = async (userId) => {
  try {
    // ✅ Usar lógica de timestamps para calcular recompensa acumulada
    const accumulatedReward = await calculateAccumulatedMiningReward(userId);

    if (!accumulatedReward.canClaim) {
      throw new Error('Not enough time has passed since last mining claim');
    }

    if (accumulatedReward.accumulatedReward <= 0) {
      throw new Error('No mining rewards to claim');
    }

    // Verificar que el usuario tenga suficiente energía
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    // Sincronizar energía antes de verificar
    user = await syncUserEnergy(user);

    const energyCost = 10;
    if (user.energyPoints < energyCost) {
      throw new Error(`Insufficient energy. Need ${energyCost} energy points but only have ${user.energyPoints}`);
    }

    // Otorgar XP usando el sistema estándar de actividades (5 XP por mining claim)
    const xpResult = await grantActivityXp(userId, 'mining');

    // ✅ Transacción atómica para actualizar balances, timestamp y otorgar posibles drops
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Usar helper de economía
      await creditTokens(userId, accumulatedReward.accumulatedReward, tx);
      
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          // Gastar energía al minar
          energyPoints: { decrement: energyCost },
          lastMiningClaim: new Date(), // ✅ Actualizar timestamp del último claim
          lastEnergyUpdate: new Date()
        },
        select: {
          id: true,
          username: true,
          tokenBalance: true,
          hashpowerVirtual: true,
          totalHashrate: true,
          energyPoints: true,
          level: true,
          xp: true,
          lastMiningClaim: true,
        }
      });

      // ✅ Sistema de Drop Aleatorio (10% de probabilidad)
      const dropChance = 0.1; 
      let droppedToken = false;
      if (Math.random() < dropChance) {
        await tx.inventoryItem.create({
          data: {
            userId: userId,
            itemId: 0, // Placeholder
            itemName: "Upgrade Token",
            itemType: "consumable",
            quantity: 1
          }
        });
        droppedToken = true;
      }

      return { updatedUser, droppedToken };
    });

    return {
      success: true,
      message: `Successfully claimed ${accumulatedReward.accumulatedReward.toFixed(6)} tokens from mining and gained ${xpResult.xpInCurrentLevel} XP${updatedUser.droppedToken ? ' + 1 Upgrade Token!' : ''}`,
      reward: accumulatedReward.accumulatedReward,
      newTokenBalance: updatedUser.updatedUser.tokenBalance,
      newEnergyPoints: updatedUser.updatedUser.energyPoints,
      lastMiningClaim: updatedUser.updatedUser.lastMiningClaim,
      xpGained: xpResult.xpInCurrentLevel,
      currentLevel: xpResult.level,
      currentXP: xpResult.xpInCurrentLevel,
      xpNeededForNextLevel: xpResult.xpNeededForNextLevel,
      droppedToken: updatedUser.droppedToken
    };
  } catch (error) {
    console.error('Error claiming mining rewards:', error);
    throw error;
  }
};

// Function to consume energy and give XP (simulates mining activity)
export const consumeEnergyForMining = async (userId, energyConsumed) => {
  try {
    // Get user to verify eligibility and current status
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Sincronizar energía
    user = await syncUserEnergy(user);

    if (user.energyPoints < energyConsumed) {
      throw new Error('Insufficient energy points');
    }

    // Get current level before XP award
    const levelBeforeXp = getLevelFromXp(user.xp);

    // Otorgar XP proporcional a la energía consumida (5 XP por punto de energía)
    const xpToAward = energyConsumed * 5;
    const xpResult = await awardXp(userId, xpToAward, 'mining');

    // Check if leveled up
    const leveledUp = xpResult.level > levelBeforeXp;

    // Update user's energy points
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        energyPoints: { decrement: energyConsumed },
        lastEnergyUpdate: new Date() // Actualizar la última fecha de actualización de energía
      },
      select: {
        id: true,
        energyPoints: true,
        level: true,
        xp: true
      }
    });

    // Calculate rewards based on level and energy consumed
    const baseRewardRate = 0.005; // Base reward per energy point
    const levelMultiplier = getLevelMultiplier(user.level); // Bonus por nivel
    const reward = energyConsumed * baseRewardRate * levelMultiplier;

    // Incrementar balance con la recompensa
    await creditTokens(userId, reward);
    
    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        balance: true,
        tokenBalance: true,
        energyPoints: true,
        level: true,
        xp: true
      }
    });

    return {
      success: true,
      energyConsumed: energyConsumed,
      reward: reward,
      xpGained: xpResult.xpInCurrentLevel, // XP ganado en esta sesión
      currentLevel: xpResult.level,
      currentXP: xpResult.xpInCurrentLevel,
      xpNeededForNextLevel: xpResult.xpNeededForNextLevel,
      newEnergyPoints: finalUser.energyPoints,
      leveledUp: leveledUp,
      newMaxEnergy: leveledUp ? xpResult.newMaxEnergy : undefined,
      message: leveledUp 
        ? `LEVEL UP! Consumed ${energyConsumed} energy and reached level ${xpResult.level}! Energy refilled to ${xpResult.newMaxEnergy}.`
        : `Successfully consumed ${energyConsumed} energy and gained ${xpResult.xpInCurrentLevel} XP`
    };
  } catch (error) {
    console.error('Error consuming energy for mining:', error);
    throw error;
  }
};