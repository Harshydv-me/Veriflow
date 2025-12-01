const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  walletAddress: String,
  role: String,
  organization: String,
  phone: String,
  avatar: String,
  bio: String,
  location: {
    country: String,
    region: String,
  },
  preferences: {
    language: {
      type: String,
      default: 'en',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    notifications: {
      type: Boolean,
      default: true,
    },
  },
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', UserSchema);

async function createTestUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const testUsers = [
      {
        email: 'farmer@test.com',
        password: 'password123',
        name: 'Test Farmer',
        role: 'farmer',
        organization: 'Test Farm',
      },
      {
        email: 'marketplace@test.com',
        password: 'password123',
        name: 'Test Marketplace',
        role: 'marketplace',
        organization: 'Test Marketplace Co.',
      },
      {
        email: 'admin@test.com',
        password: 'password123',
        name: 'Test Admin',
        role: 'admin',
        organization: 'VeriFlow Admin',
      },
    ];

    console.log('\n=== Creating/Updating Test Users ===');
    for (const userData of testUsers) {
      // Check if user exists
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        // Update password and role
        existingUser.password = userData.password;
        existingUser.role = userData.role;
        existingUser.name = userData.name;
        existingUser.organization = userData.organization;
        await existingUser.save();
        console.log(`✓ Updated: ${userData.email} (${userData.role})`);
      } else {
        // Create new user
        await User.create(userData);
        console.log(`✓ Created: ${userData.email} (${userData.role})`);
      }
    }

    console.log('\n=== Test Users Ready ===');
    console.log('Email: farmer@test.com | Password: password123 | Role: farmer');
    console.log('Email: marketplace@test.com | Password: password123 | Role: marketplace');
    console.log('Email: admin@test.com | Password: password123 | Role: admin');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestUsers();
