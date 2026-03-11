/**
 * Database Seeding Script
 * Populates the database with initial test data including 4 users with different roles
 * 
 * Usage: node server/seed.js
 * 
 * Validates Requirements: 3.1, 3.6, 4.1
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const { connectDB } = require('./config/database');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Settings = require('./models/Settings');

// Test user credentials
const TEST_USERS = [
  {
    email: 'admin@club.com',
    password: 'password123',
    role: 'admin',
    profile: {
      fullName: 'Admin User',
      position: 'Staff'
    }
  },
  {
    email: 'manager@club.com',
    password: 'password123',
    role: 'manager',
    profile: {
      fullName: 'Manager User',
      position: 'Staff'
    }
  },
  {
    email: 'coach@club.com',
    password: 'password123',
    role: 'coach',
    profile: {
      fullName: 'Coach User',
      position: 'Staff'
    }
  },
  {
    email: 'player@club.com',
    password: 'password123',
    role: 'player',
    profile: {
      fullName: 'Player User',
      position: 'Forward',
      weight: 75,
      height: 180,
      contractType: 'Full-Time',
      contractStart: new Date(),
      contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    }
  }
];

/**
 * Hash password using bcrypt with cost factor 10
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  const saltRounds = 10; // Requirement 21.6: bcrypt cost factor of 10
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Clear existing data from collections
 * Optional but recommended for testing to ensure clean state
 */
async function clearExistingData() {
  console.log('\n🗑️  Clearing existing data...');
  
  try {
    await User.deleteMany({});
    console.log('  ✓ Cleared Users collection');
    
    await Profile.deleteMany({});
    console.log('  ✓ Cleared Profiles collection');
    
    await Settings.deleteMany({});
    console.log('  ✓ Cleared Settings collection');
    
    console.log('✓ All collections cleared successfully\n');
  } catch (error) {
    console.error('✗ Error clearing collections:', error.message);
    throw error;
  }
}

/**
 * Create users with associated profiles
 */
async function seedUsers() {
  console.log('👥 Creating users and profiles...\n');
  
  const createdUsers = [];
  
  for (const userData of TEST_USERS) {
    try {
      // Hash password
      const passwordHash = await hashPassword(userData.password);
      
      // Create user
      const user = await User.create({
        email: userData.email,
        passwordHash: passwordHash,
        role: userData.role
      });
      
      // Create associated profile
      const profile = await Profile.create({
        userId: user._id,
        ...userData.profile
      });
      
      createdUsers.push({
        email: userData.email,
        password: userData.password,
        role: userData.role,
        userId: user._id,
        profileId: profile._id
      });
      
      console.log(`  ✓ Created ${userData.role.toUpperCase()}: ${userData.email}`);
      
    } catch (error) {
      console.error(`  ✗ Error creating user ${userData.email}:`, error.message);
      throw error;
    }
  }
  
  console.log('\n✓ All users and profiles created successfully\n');
  return createdUsers;
}

/**
 * Create initial settings document
 */
async function seedSettings() {
  console.log('⚙️  Creating initial settings...\n');
  
  try {
    const settings = await Settings.create({
      clubName: 'Football Club Management System',
      logoUrl: null
    });
    
    console.log(`  ✓ Created Settings: ${settings.clubName}`);
    console.log(`  ✓ Settings ID: ${settings._id}\n`);
    
    return settings;
  } catch (error) {
    console.error('  ✗ Error creating settings:', error.message);
    throw error;
  }
}

/**
 * Display seeded credentials in a clear format
 */
function displayCredentials(users) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                  SEEDED USER CREDENTIALS                  ');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.role.toUpperCase()}`);
    console.log(`   Email:    ${user.email}`);
    console.log(`   Password: ${user.password}`);
    console.log(`   User ID:  ${user.userId}`);
    console.log(`   Profile:  ${user.profileId}`);
    console.log('');
  });
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('NOTE: All passwords are "password123" for testing purposes');
  console.log('═══════════════════════════════════════════════════════════\n');
}

/**
 * Main seeding function
 */
async function seed() {
  try {
    console.log('\n🌱 Starting database seeding process...\n');
    
    // Connect to database
    await connectDB();
    console.log('');
    
    // Clear existing data (optional but recommended for testing)
    await clearExistingData();
    
    // Seed users and profiles
    const users = await seedUsers();
    
    // Seed settings
    await seedSettings();
    
    // Display credentials
    displayCredentials(users);
    
    console.log('✅ Database seeding completed successfully!\n');
    
    // Exit process
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run seeding
seed();
