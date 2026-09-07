import prisma from './prisma.mjs';

/**
 * Módulo centralizado para la gestión de energía del usuario.
 * Proporciona una única fuente de verdad para el cálculo y actualización de la energía.
 */

const REGEN_POINTS = 8;
const REGEN_INTERVAL_MINUTES = 5;

// Calcula la energía máxima según el nivel
export const calculateMaxEnergy = (level) => {
  return 100 + (level * 10);
};

// Calcula la energía actual considerando la regeneración basada en tiempo
export const calculateCurrentEnergy = (user) => {
  const maxEnergy = calculateMaxEnergy(user.level);
  
  const lastEnergyUpdate = user.lastEnergyUpdate || user.updatedAt;
  const now = new Date();
  const timeDiff = now - new Date(lastEnergyUpdate); // en milisegundos
  
  const minutesPassed = timeDiff / (1000 * 60);
  const cycles = Math.floor(minutesPassed / REGEN_INTERVAL_MINUTES);
  const regenerated = cycles * REGEN_POINTS;
  
  return {
    current: Math.min(user.energyPoints + regenerated, maxEnergy),
    max: maxEnergy,
    lastUpdate: user.lastEnergyUpdate
  };
};

// Actualiza la energía en la base de datos si ha cambiado
export const syncUserEnergy = async (user) => {
  const { current } = calculateCurrentEnergy(user);
  
  if (current > user.energyPoints) {
    return await prisma.user.update({
      where: { id: user.id },
      data: {
        energyPoints: current,
        lastEnergyUpdate: new Date()
      }
    });
  }
  return user;
};
