const sqlite3 = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const db = new sqlite3(dbPath);

// Check if test user exists
const existingUser = db.prepare('SELECT id, username, email, isAdmin FROM User WHERE email = ? OR username = ?').get('test@example.com', 'testuser');

if (existingUser) {
  console.log('✅ User exists!');
  console.log('ID:', existingUser.id);
  console.log('Username:', existingUser.username);
  console.log('Email:', existingUser.email);
  console.log('Is Admin:', existingUser.isAdmin ? 'YES ✓' : 'NO ✗');
  
  if (!existingUser.isAdmin) {
    console.log('\n⚠️  Making user admin...');
    db.prepare('UPDATE User SET isAdmin = 1 WHERE id = ?').run(existingUser.id);
    console.log('✅ User is now admin!');
  }
  
  console.log('\n📍 Login with:');
  console.log('   Username: testuser');
  console.log('   Password: password123');
  console.log('   Admin panel: http://localhost:3000/admin');
} else {
  console.log('📝 Creating new admin user...\n');
  
  const hashedPassword = bcrypt.hashSync('password123', 10);
  
  const result = db.prepare(`
    INSERT INTO User (email, username, password, balance, tokenBalance, boundTokenBalance, energyPoints, level, xp, isAdmin, isActive)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'test@example.com',
    'testuser',
    hashedPassword,
    1000.0,
    500.0,
    200.0,
    100,
    5,
    250,
    1,  // isAdmin = true
    1   // isActive = true
  );
  
  console.log('✅ Admin user created!');
  console.log('\n📍 Login with:');
  console.log('   Username: testuser');
  console.log('   Email: test@example.com');
  console.log('   Password: password123');
  console.log('   Admin panel: http://localhost:3000/admin');
}

db.close();
console.log('\n✨ Done!');
