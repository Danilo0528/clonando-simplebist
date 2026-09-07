import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addItems() {
  try {
    const items = [
      { name: "Quantum Miner v1", description: "Basic hardware", price: 100, type: "hardware", hashrate: 50 },
      { name: "Quantum Miner v2", description: "Advanced hardware", price: 300, type: "hardware", hashrate: 150 },
      { name: "Admin Miner Pro", description: "Ultimate Admin Hardware", price: 1000, type: "hardware", hashrate: 500 },
      { name: "Code Optimizer", description: "Software boost", price: 50, type: "consumable", hashrate: 0 },
      { name: "Battery Pack", description: "Refills energy", price: 20, type: "consumable", hashrate: 0 },
      { name: "Upgrade Token", description: "Use to upgrade items", price: 200, type: "consumable", hashrate: 0 }
    ];

    for (const item of items) {
      await prisma.marketItem.upsert({
        where: { name: item.name },
        update: { ...item },
        create: item
      });
    }
    console.log("Items added/updated in market");
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

addItems();
