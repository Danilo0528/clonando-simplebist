import { createMarketItem } from './lib/market.js';

const initialMarketItems = [
  {
    name: 'Starter Miner',
    description: 'A basic mining rig to get you started',
    price: 500,
    type: 'hardware',
    hashrate: 10, // 10 MH/s
    image: '/images/starter-miner.png',
    isActive: true,
  },
  {
    name: 'Superior Miner',
    description: 'An advanced mining rig with better efficiency',
    price: 1500,
    type: 'hardware',
    hashrate: 50, // 50 MH/s
    image: '/images/superior-miner.png',
    isActive: true,
  },
  {
    name: 'Advanced Mining Rig',
    description: 'Professional grade mining equipment',
    price: 5000,
    type: 'hardware',
    hashrate: 200, // 200 MH/s
    image: '/images/advanced-miner.png',
    isActive: true,
  },
  {
    name: 'Energy Boost Pack',
    description: 'Instantly restore 500 energy points',
    price: 50,
    type: 'consumable',
    hashrate: 0,
    image: null,
    isActive: true,
  },
  {
    name: 'Premium Mining Rig',
    description: 'Top-of-the-line mining powerhouse',
    price: 12000,
    type: 'hardware',
    hashrate: 500, // 500 MH/s
    image: null,
    isActive: true,
  },
  {
    name: 'XP Booster',
    description: 'Double XP for 24 hours',
    price: 100,
    type: 'booster',
    hashrate: 0,
    image: null,
    isActive: true,
  },
];

async function seedMarket() {
  console.log('🌱 Seeding market items...');
  
  try {
    for (const item of initialMarketItems) {
      try {
        const created = await createMarketItem(item);
        console.log(`✅ Created: ${created.name} (${created.price} SBT)`);
      } catch (error) {
        // Si el item ya existe (nombre duplicado), saltar
        if (error.message.includes('Unique constraint')) {
          console.log(`⏭️  Skipped (already exists): ${item.name}`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('✅ Market seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding market:', error);
  }
}

seedMarket();
