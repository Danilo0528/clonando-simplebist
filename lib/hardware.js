import prisma from './prisma.mjs';
import { debitTokens, creditBound } from './economy.js';

/**
 * Módulo para gestionar el alquiler de Hardware (Fase B).
 * - Compra de planes de minería con tokenBalance.
 * - Maduración de planes (payout diario basado en timestamps).
 * - Payout en boundTokenBalance con interés (ROI).
 */

// Planes de hardware (los mismos que muestra la UI)
export const HARDWARE_PLANS = [
  {
    name: 'STARTER',
    price: 5000,
    durationDays: 60,
    profit: 5600,
    fundHash: 15,
  },
  {
    name: 'SUPERIOR',
    price: 5000,
    durationDays: 90,
    profit: 6250,
    fundHash: 20,
  },
  {
    name: 'ADVANCED',
    price: 5000,
    durationDays: 120,
    profit: 6750,
    fundHash: 30,
  },
];

export const getMonthlyProfitPct = (plan) => {
  const totalPct = ((plan.profit - plan.price) / plan.price) * 100;
  return totalPct / (plan.durationDays / 30);
};

// Sincroniza los planes como MarketItems (para que el inventario/admin los vea)
export const syncHardwarePlans = async () => {
  if (!process.env.HARDWARE_PLAN_SYNC_DONE) {
    process.env.HARDWARE_PLAN_SYNC_DONE = '1';
  }
  for (const plan of HARDWARE_PLANS) {
    await prisma.marketItem.upsert({
      where: { name: plan.name },
      update: {
        price: plan.price,
        type: 'hardware',
        hashrate: plan.fundHash,
        isActive: true,
      },
      create: {
        name: plan.name,
        description: `Rent hardware plan: ${plan.durationDays} days, ROI ${plan.profit - plan.price} SBT`,
        price: plan.price,
        type: 'hardware',
        hashrate: plan.fundHash,
        isActive: true,
      },
    });
  }
  return HARDWARE_PLANS;
};

// Lista de planes con métricas calculadas
export const getHardwarePlans = async () => {
  await syncHardwarePlans();
  return HARDWARE_PLANS.map((plan) => ({
    ...plan,
    monthlyProfit: `+${getMonthlyProfitPct(plan).toFixed(2)}%`,
    profitability: `+${Math.round(((plan.profit - plan.price) / plan.price) * 100)}%`,
  }));
};

const getPlanByName = (name) => {
  const plan = HARDWARE_PLANS.find((p) => p.name.toUpperCase() === String(name).toUpperCase());
  if (!plan) throw new Error('Hardware plan not found');
  return plan;
};

// Rent hardware: debita tokenBalance y crea un contrato por unidad comprada
export const rentHardware = async (userId, planName, quantity = 1) => {
  const qty = Math.max(1, parseInt(quantity, 10));
  const plan = getPlanByName(planName);
  const totalCost = plan.price * qty;

  if (!Number.isFinite(totalCost) || totalCost <= 0) {
    throw new Error('Invalid rental amount');
  }

  const result = await prisma.$transaction(async (tx) => {
    await debitTokens(userId, totalCost, tx);

    const marketItem = await tx.marketItem.findUnique({
      where: { name: plan.name },
    });

    if (!marketItem) {
      throw new Error('Hardware plan not available');
    }

    const now = new Date();
    const contracts = [];
    for (let i = 0; i < qty; i++) {
      contracts.push(
        await tx.rentalContract.create({
          data: {
            userId,
            marketItemId: marketItem.id,
            amountPaid: plan.price,
            expectedPayout: plan.profit,
            durationDays: plan.durationDays,
            startTime: now,
            endTime: new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000),
            status: 'active',
          },
        }),
      );
    }

    return contracts;
  });

  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokenBalance: true },
  });

  return {
    success: true,
    message: `Rented ${qty}x ${plan.name} hardware (${totalCost} SBT)`,
    contracts: result.map((c) => c.id),
    totalCost,
    newTokenBalance: updatedUser.tokenBalance,
  };
};

// Obtener alquileres activos de un usuario
export const getUserActiveRentals = async (userId) => {
  return await prisma.rentalContract.findMany({
    where: {
      userId: userId,
      status: 'active',
    },
    orderBy: { startTime: 'desc' },
  });
};

// Payout diario (por contrato) = expectedPayout / durationDays
const getDailyPayout = (contract) => {
  return (contract.expectedPayout - contract.amountPaid) / Math.max(1, contract.durationDays);
};

// Payout pendiente acumulado de un contrato (timestamp-based)
export const calculateContractPendingPayout = (contract) => {
  const now = Date.now();
  const start = contract.lastClaimTime || contract.startTime;
  const end = Math.min(now, contract.endTime.getTime());

  if (end <= start.getTime()) return 0;

  const msPerDay = 24 * 60 * 60 * 1000;
  const fullDays = Math.floor((end - start.getTime()) / msPerDay);

  if (fullDays <= 0) return 0;

  return fullDays * getDailyPayout(contract);
};

// Estado completo del usuario (stats de la página Hardware)
export const getUserHardwareStatus = async (userId) => {
  const [activeRentals, allRentals] = await Promise.all([
    getUserActiveRentals(userId),
    prisma.rentalContract.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
    }),
  ]);

  // Resolver marketItem (hashrate) para cada contrato activo
  const contractsWithHash = await Promise.all(
    activeRentals.map(async (c) => {
      const mi = c.marketItem || (await prisma.marketItem.findUnique({ where: { id: c.marketItemId } }));
      return { ...c, marketItem: mi };
    }),
  );

  const totalUnits = contractsWithHash.length;
  const dailyIncome = contractsWithHash.reduce((sum, c) => sum + getDailyPayout(c), 0);
  const accrued = contractsWithHash.reduce((sum, c) => sum + calculateContractPendingPayout(c), 0);
  const totalHash = contractsWithHash.reduce((sum, c) => sum + (c.marketItem?.hashrate || 0), 0);
  const lastClaim = allRentals
    .map((c) => c.lastClaimTime)
    .filter(Boolean)
    .sort((a, b) => b - a)[0];

  return {
    totalHardware: totalUnits,
    totalContracts: allRentals.length,
    dailyIncome,
    totalHash,
    accrued,
    lastClaim,
    activeRentals: contractsWithHash,
    plans: await getHardwarePlans(),
  };
};

// Claim del payout acumulado → boundTokenBalance
export const claimHardwareReward = async (userId) => {
  const activeRentals = await getUserActiveRentals(userId);

  if (activeRentals.length === 0) {
    throw new Error('No active hardware rentals');
  }

  let claimable = 0;
  for (const contract of activeRentals) {
    claimable += calculateContractPendingPayout(contract);
  }

  if (claimable <= 0) {
    throw new Error('No hardware payout available yet. Come back in 24h.');
  }

  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    // Credit payout to bound
    await creditBound(userId, claimable, tx);

    // Update each contract (mark claim time, close when matured)
    for (const contract of activeRentals) {
      const matured = now.getTime() >= contract.endTime.getTime();
      await tx.rentalContract.update({
        where: { id: contract.id },
        data: {
          lastClaimTime: now,
          status: matured ? 'completed' : 'active',
        },
      });
    }

    const updatedUser = await tx.user.findUnique({
      where: { id: userId },
      select: { boundTokenBalance: true },
    });

    return updatedUser;
  });

  return {
    success: true,
    message: `Claimed ${claimable.toFixed(6)} bound tokens from hardware`,
    reward: claimable,
    newBoundBalance: result.boundTokenBalance,
    claimedAt: now,
  };
};

// Hashrate adicional que aportan los rentals activos (para mining)
export const getActiveRentalHashrate = async (userId) => {
  const activeRentals = await prisma.rentalContract.findMany({
    where: { userId, status: 'active' },
    select: { marketItemId: true },
  });

  if (activeRentals.length === 0) return 0;

  const items = await prisma.marketItem.findMany({
    where: { id: { in: [...new Set(activeRentals.map((c) => c.marketItemId))] } },
  });

  return items.reduce((sum, item) => sum + (item.hashrate || 0), 0);
};