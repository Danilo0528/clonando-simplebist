import prisma from './prisma.mjs';

/**
 * Módulo para gestionar el alquiler de Hardware (Fase B).
 * Permite registrar contratos, obtener alquileres activos y procesar pagos.
 */

// Registrar un nuevo contrato de alquiler
export const createRentalContract = async (userId, marketItemId, amountPaid, expectedPayout, durationDays) => {
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + durationDays * 24 * 60 * 60 * 1000);

  return await prisma.rentalContract.create({
    data: {
      userId: parseInt(userId),
      marketItemId: parseInt(marketItemId),
      amountPaid: parseFloat(amountPaid),
      expectedPayout: parseFloat(expectedPayout),
      startTime,
      endTime,
      status: 'active',
    },
  });
};

// Obtener alquileres activos de un usuario
export const getUserActiveRentals = async (userId) => {
  return await prisma.rentalContract.findMany({
    where: {
      userId: parseInt(userId),
      status: 'active',
    },
    orderBy: { startTime: 'desc' },
  });
};
