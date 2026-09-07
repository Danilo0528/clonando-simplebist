
import * as energyModule from './lib/energy.mjs';
const { calculateCurrentEnergy, calculateMaxEnergy } = energyModule;

// Simulamos un usuario
const now = new Date();
const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000); // Hace 5 minutos

const user = {
    id: 1,
    level: 1, // Max energy: 110
    energyPoints: 50,
    lastEnergyUpdate: fiveMinutesAgo, // Debería haber regenerado 8 puntos
    updatedAt: fiveMinutesAgo
};

console.log('--- Probando Motor de Energía ---');
console.log('Usuario nivel:', user.level);
console.log('Energía inicial:', user.energyPoints);

const result = calculateCurrentEnergy(user);

console.log('Energía calculada (debería ser 58):', result.current);
console.log('Energía máxima calculada (debería ser 110):', result.max);

if (result.current === 58) {
    console.log('✅ Prueba exitosa: La regeneración funciona correctamente.');
} else {
    console.error('❌ Prueba fallida: El cálculo no es el esperado.');
}
