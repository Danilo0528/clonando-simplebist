import { PrismaClient } from '@prisma/client';
import pkgFaucet from './lib/faucet.js';
const { claimFaucet } = pkgFaucet;
import pkgWithdrawal from './lib/withdrawal.js';
const { requestWithdrawal } = pkgWithdrawal;

const prisma = new PrismaClient();

async function runTestFlow() {
  console.log('--- Iniciando prueba de flujo auto-contenida: Faucet -> Withdraw ---');
  
  const testEmail = 'automated-test@example.com';
  let testUser;

  try {
    // 0. Preparación: Crear usuario de prueba
    console.log('Creando usuario de prueba...');
    testUser = await prisma.user.create({
        data: {
            username: 'AutoTestUser',
            email: testEmail,
            password: 'securePassword123', // En un entorno real esto debería estar hasheado
            balance: 10,
            boundTokenBalance: 10, // Balance suficiente para el retiro
        }
    });
    console.log(`Usuario creado: ${testUser.username} (ID: ${testUser.id})`);

    // 1. Reclamar Faucet
    console.log('Intentando reclamar Faucet...');
    const faucetResult = await claimFaucet(testUser.id);
    console.log(`✅ Reclamo exitoso. Recompensa: ${faucetResult.rewardAmount}, Nuevo balance: ${faucetResult.newBalance}`);

    // 2. Solicitar Retiro
    console.log('Intentando solicitar retiro...');
    const withdrawalAmount = 0.5;
    const withdrawalResult = await requestWithdrawal(testUser.id, withdrawalAmount, 'bc1qtestaddress123456789', 'BTC');
    
    console.log(`✅ Retiro solicitado exitosamente. ID: ${withdrawalResult.withdrawalId}, Monto Neto: ${withdrawalResult.netAmount}`);

    // 3. Verificar historial
    const history = await prisma.withdrawal.findMany({ where: { userId: testUser.id } });
    console.log(`✅ Historial de retiros contiene ${history.length} registro(s).`);

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    // 4. Limpieza
    if (testUser) {
        console.log('Limpiando: Eliminando usuario de prueba...');
        await prisma.withdrawal.deleteMany({ where: { userId: testUser.id } });
        await prisma.user.delete({ where: { id: testUser.id } });
        console.log('✅ Usuario eliminado.');
    }
    await prisma.$disconnect();
    console.log('--- Prueba finalizada ---');
  }
}

runTestFlow();
