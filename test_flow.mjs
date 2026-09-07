import { PrismaClient } from '@prisma/client';
import pkgFaucet from './lib/faucet.js';
const { claimFaucet } = pkgFaucet;
import pkgWithdrawal from './lib/withdrawal.js';
const { requestWithdrawal } = pkgWithdrawal;

const prisma = new PrismaClient();

async function runTestFlow() {
  console.log('--- Iniciando prueba de flujo: Faucet -> Withdraw ---');

  try {
    // 1. Obtener usuario de prueba (usando el email del script create-test-user-cjs.js)
    const user = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
    if (!user) {
      throw new Error('Usuario de prueba no encontrado. Ejecuta create-test-user-cjs.js primero.');
    }
    console.log(`Usuario encontrado: ${user.username} (ID: ${user.id}, Balance: ${user.balance})`);

    // 2. Reclamar Faucet
    console.log('Intentando reclamar Faucet...');
    // Resetear última reclamación para poder probar
    await prisma.user.update({
        where: { id: user.id },
        data: { lastFaucetClaim: new Date(Date.now() - 2 * 60 * 60 * 1000) } // Hace 2 horas
    });
    
    const faucetResult = await claimFaucet(user.id);
    console.log(`✅ Reclamo exitoso. Recompensa: ${faucetResult.rewardAmount}, Nuevo balance: ${faucetResult.newBalance}`);

    // 3. Solicitar Retiro
    console.log('Intentando solicitar retiro...');
    const withdrawalAmount = 0.5; // Un monto mayor al mínimo (0.1)
    const withdrawalResult = await requestWithdrawal(user.id, withdrawalAmount, 'bc1qtestaddress123456789', 'BTC');
    
    console.log(`✅ Retiro solicitado exitosamente. ID: ${withdrawalResult.withdrawalId}, Monto Neto: ${withdrawalResult.netAmount}`);
    console.log(`Nuevo balance tras retiro: ${withdrawalResult.newUserBalance}`);

    // 4. Verificar historial
    const history = await prisma.withdrawal.findMany({ where: { userId: user.id } });
    console.log(`✅ Historial de retiros contiene ${history.length} registro(s).`);

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('--- Prueba finalizada ---');
  }
}

runTestFlow();
