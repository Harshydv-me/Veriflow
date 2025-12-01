import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';

// Load environment variables
dotenv.config();

const testUsers = [
  {
    name: 'Farmer Demo',
    email: 'farmer@test.com',
    password: 'test123',
    role: 'farmer',
    phone: '+1234567890',
    organization: 'Green Farms Co.',
  },
  {
    name: 'Marketplace Buyer',
    email: 'marketplace@test.com',
    password: 'test123',
    role: 'marketplace',
    organization: 'Carbon Credits Inc.',
  },
  {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'test123',
    role: 'admin',
    organization: 'Blue Carbon Registry',
  },
  {
    name: 'Test User',
    email: 'jshyd05@gmail.com',
    password: 'test123',
    role: 'marketplace',
    organization: 'Test Organization',
  },
];

const setupTestUsers = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bluecarbon';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing test users
    console.log('\n🗑️  Removing existing test users...');
    const testEmails = testUsers.map(u => u.email);
    await User.deleteMany({ email: { $in: testEmails } });

    // Create new test users
    console.log('👥 Creating test users...\n');
    for (const userData of testUsers) {
      const user = await User.create(userData);
      console.log(`✅ Created ${user.role} user:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: test123`);
      console.log(`   Name: ${user.name}\n`);
    }

    console.log('='.repeat(60));
    console.log('🎉 Test users setup complete!');
    console.log('='.repeat(60));
    console.log('\nYou can now login with any of these credentials:');
    console.log('\nFarmer Account:');
    console.log('  Email: farmer@test.com');
    console.log('  Password: test123');
    console.log('\nMarketplace Account:');
    console.log('  Email: marketplace@test.com');
    console.log('  Password: test123');
    console.log('\nAdmin Account:');
    console.log('  Email: admin@test.com');
    console.log('  Password: test123');
    console.log('\nYour Account:');
    console.log('  Email: jshyd05@gmail.com');
    console.log('  Password: test123');
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error setting up test users:', error.message);
    process.exit(1);
  }
};

setupTestUsers();
