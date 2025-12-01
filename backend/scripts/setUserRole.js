const mongoose = require('mongoose');
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
    language: String,
    currency: String,
    notifications: Boolean,
  },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function setUserRole() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get command line arguments
    const email = process.argv[2];
    const role = process.argv[3];

    if (!email || !role) {
      console.log('\nUsage: node setUserRole.js <email> <role>');
      console.log('Roles: farmer, marketplace, admin');
      console.log('\nExample: node setUserRole.js admin@example.com admin');

      // List all users
      const users = await User.find({}, { email: 1, role: 1, name: 1 });
      console.log('\n=== Current Users ===');
      if (users.length === 0) {
        console.log('No users found in database');
      } else {
        users.forEach(user => {
          console.log(`Email: ${user.email}, Role: ${user.role}, Name: ${user.name}`);
        });
      }

      await mongoose.disconnect();
      return;
    }

    if (!['farmer', 'marketplace', 'admin'].includes(role)) {
      console.log('Invalid role. Must be: farmer, marketplace, or admin');
      await mongoose.disconnect();
      return;
    }

    // Update user role
    const result = await User.updateOne(
      { email: email.toLowerCase() },
      { $set: { role } }
    );

    if (result.matchedCount === 0) {
      console.log(`User with email ${email} not found`);
    } else if (result.modifiedCount === 0) {
      console.log(`User ${email} already has role: ${role}`);
    } else {
      console.log(`✓ Successfully updated ${email} to role: ${role}`);
    }

    // Show updated user
    const user = await User.findOne({ email: email.toLowerCase() }, { email: 1, role: 1, name: 1 });
    if (user) {
      console.log(`Current state - Email: ${user.email}, Role: ${user.role}, Name: ${user.name}`);
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setUserRole();
