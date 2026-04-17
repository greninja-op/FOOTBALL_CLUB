/**
 * Seed 24 Player Accounts
 * Creates 24 player users with random (non-famous) names
 * Password: 12345678 for all
 * Email: playername@gmail.com
 * 
 * Usage: node server/seed-players.js
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const { connectDB } = require('./config/database');
const User = require('./models/User');
const Profile = require('./models/Profile');

const PLAYER_NAMES = [
  'Arjun Menon',
  'Rohit Sharma',
  'Vikram Das',
  'Suresh Pillai',
  'Anil Kumar',
  'Ravi Teja',
  'Deepak Nair',
  'Kiran Raj',
  'Manoj Varma',
  'Sanjay Patil',
  'Ashwin Iyer',
  'Pranav Reddy',
  'Nikhil Joshi',
  'Rahul Verma',
  'Anand Mishra',
  'Tarun Gupta',
  'Varun Kapoor',
  'Harish Shetty',
  'Dinesh Mohan',
  'Ganesh Rao',
  'Prem Shankar',
  'Siddharth Bose',
  'Ajay Thakur',
  'Naveen Singh'
];

const POSITIONS = ['Goalkeeper', 'Defender', 'Defender', 'Defender', 'Defender', 'Midfielder', 'Midfielder', 'Midfielder', 'Midfielder', 'Forward', 'Forward', 'Forward',
  'Goalkeeper', 'Defender', 'Defender', 'Defender', 'Midfielder', 'Midfielder', 'Midfielder', 'Midfielder', 'Forward', 'Forward', 'Defender', 'Forward'];

async function seedPlayers() {
  try {
    console.log('\n⚽ Starting player seeding...\n');
    
    await connectDB();
    console.log('');

    const password = '12345678';
    const passwordHash = await bcrypt.hash(password, 10);
    let created = 0;
    let skipped = 0;

    for (let i = 0; i < PLAYER_NAMES.length; i++) {
      const fullName = PLAYER_NAMES[i];
      const emailName = fullName.toLowerCase().replace(/\s+/g, '');
      const email = `${emailName}@gmail.com`;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log(`  ⏭ Skipping ${fullName} (${email}) - already exists`);
        skipped++;
        continue;
      }

      // Create user
      const user = await User.create({
        email,
        passwordHash,
        role: 'player'
      });

      // Create profile
      await Profile.create({
        userId: user._id,
        fullName,
        position: POSITIONS[i] || 'Midfielder',
        weight: 65 + Math.floor(Math.random() * 20),
        height: 170 + Math.floor(Math.random() * 15),
        contractType: 'Full-Time',
        contractStart: new Date(),
        contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      });

      created++;
      console.log(`  ✓ Created PLAYER: ${fullName} (${email})`);
    }

    console.log(`\n✅ Player seeding completed!`);
    console.log(`   Created: ${created} players`);
    console.log(`   Skipped: ${skipped} (already existed)`);
    console.log(`   Password for all: ${password}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Player seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedPlayers();
