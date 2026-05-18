// Utility script to view and manage users in MongoDB
// Run: node scripts/viewUsers.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// User model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  profile: Object,
  lastLogin: Date,
  loginCount: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
});

const User = mongoose.model('User', userSchema);

async function viewAllUsers() {
  try {
    console.log('\n=== Connecting to MongoDB ===');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');
    console.log('✓ Connected successfully\n');

    console.log('=== ALL REGISTERED USERS ===\n');
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    if (users.length === 0) {
      console.log('No users found in database');
      return;
    }

    console.log(`Total Users: ${users.length}\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Registered: ${user.createdAt.toLocaleString()}`);
      console.log(`   Last Login: ${user.lastLogin ? user.lastLogin.toLocaleString() : 'Never'}`);
      console.log(`   Login Count: ${user.loginCount || 0}`);
      console.log(`   Status: ${user.isActive ? 'Active' : 'Inactive'}`);
      console.log('');
    });

    // Statistics
    console.log('=== STATISTICS ===');
    const totalUsers = users.length;
    const jobseekers = users.filter(u => u.role === 'jobseeker').length;
    const employers = users.filter(u => u.role === 'employer').length;
    const usersWithLogins = users.filter(u => u.loginCount > 0).length;
    const neverLoggedIn = totalUsers - usersWithLogins;

    console.log(`Total Users: ${totalUsers}`);
    console.log(`Job Seekers: ${jobseekers}`);
    console.log(`Employers: ${employers}`);
    console.log(`Users Who Logged In: ${usersWithLogins}`);
    console.log(`Never Logged In: ${neverLoggedIn}`);

    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

viewAllUsers();
