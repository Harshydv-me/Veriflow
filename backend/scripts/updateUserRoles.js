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

async function updateUserRoles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check all users
    const users = await User.find({}, { email: 1, role: 1, name: 1 });
    console.log('\n=== Current Users ===');
    users.forEach(user => {
      console.log(`Email: ${user.email}, Role: ${user.role}, Name: ${user.name}`);
    });

    // Update specific users based on their email patterns
    // Marketplace users
    const marketplaceUpdate = await User.updateMany(
      {
        $or: [
          { email: /marketplace/i },
          { email: /market/i },
          { role: 'marketplace' }
        ]
      },
      { $set: { role: 'marketplace' } }
    );
    console.log(`\nUpdated ${marketplaceUpdate.modifiedCount} marketplace users`);

    // Admin users
    const adminUpdate = await User.updateMany(
      {
        $or: [
          { email: /admin/i },
          { email: /verifier/i },
          { role: 'admin' },
          { role: 'verifier' }
        ]
      },
      { $set: { role: 'admin' } }
    );
    console.log(`Updated ${adminUpdate.modifiedCount} admin users`);

    // Farmer users (default) - only update if role is not already marketplace or admin
    const farmerUpdate = await User.updateMany(
      {
        role: { $nin: ['marketplace', 'admin'] }
      },
      { $set: { role: 'farmer' } }
    );
    console.log(`Updated ${farmerUpdate.modifiedCount} farmer users`);

    // Show updated users
    const updatedUsers = await User.find({}, { email: 1, role: 1, name: 1 });
    console.log('\n=== Updated Users ===');
    updatedUsers.forEach(user => {
      console.log(`Email: ${user.email}, Role: ${user.role}, Name: ${user.name}`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateUserRoles();
