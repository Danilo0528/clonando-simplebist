const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Intentando conectar a la base de datos...');
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conexión exitosa:', result);
  } catch (e) {
    console.error('❌ Error de conexión:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
main();
