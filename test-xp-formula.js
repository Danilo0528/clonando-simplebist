// Test final de fórmula con valores reales

const getXpForLevel = (level) => 100 * Math.pow(level - 1, 2);
const getLevelFromXp = (totalXp) => 1 + Math.floor(Math.sqrt(totalXp / 100));

console.log('=== Sistema corregido: 5 XP por energía ===\n');

let xp = 0;
let energy = 100; // Energía inicial nivel 1

console.log('Estado inicial:');
console.log(`  Nivel: ${getLevelFromXp(xp)}, XP: ${xp}, Energía: ${energy}`);
console.log(`  Para nivel 2 necesitas: ${getXpForLevel(2)} XP\n`);

// Simular mineo de 100 energía de una vez
const energyConsumed = 100;
const xpGained = energyConsumed * 5;
energy -= energyConsumed;
xp += xpGained;

const newLevel = getLevelFromXp(xp);
const maxXpForNewLevel = 100 + (newLevel * 10);

console.log(`⛏️ Minas con 100 energía:`);
console.log(`  XP ganadas: ${xpGained}`);
console.log(`  Nueva XP total: ${xp}`);
console.log(`  Nuevo nivel: ${newLevel}`);
console.log(`  Energía restante: ${energy}`);
console.log(`  Energía recargada a: ${maxXpForNewLevel} (máximo del nivel ${newLevel})`);

console.log('\n=== Progresión esperada ===');
for (let lvl = 1; lvl <= 5; lvl++) {
    const xpNeeded = getXpForLevel(lvl);
    const maxEnergy = 100 + (lvl * 10);
    const minesToLevel = Math.ceil((getXpForLevel(lvl + 1) - xpNeeded) / 5);
    console.log(`Nivel ${lvl}: ${xpNeeded} XP | Max energía: ${maxEnergy} | Mines de 1 energía para lvl up: ~${minesToLevel}`);
}
