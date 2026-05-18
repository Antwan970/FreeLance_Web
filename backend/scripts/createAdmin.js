// Script to create or update the first admin user.
// Run: node scripts/createAdmin.js

const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const User = require('../models/User');

dotenv.config();

const ADMIN_EMAIL = 'Antwan3@gmail.com';
const ADMIN_PASSWORD = '1234578';
const ADMIN_NAME = 'Antwan';

async function createAdmin() {
  try {
    console.log('\n=== Creating Admin User ===\n');

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal');
    console.log('Connected to MongoDB\n');

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const user = await User.findOneAndUpdate(
      { email: ADMIN_EMAIL },
      {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'employer',
        isActive: true,
      },
      {
        new: true,
        setDefaultsOnInsert: true,
        upsert: true,
      }
    );

    const admin = await Admin.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: 'superadmin',
        permissions: {
          viewUsers: true,
          editUsers: true,
          deleteUsers: true,
          viewJobs: true,
          editJobs: true,
          viewStats: true,
        },
        status: 'active',
      },
      {
        new: true,
        setDefaultsOnInsert: true,
        upsert: true,
      }
    );

    console.log('Admin is ready.\n');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log(`Role: ${admin.role}`);
    console.log('\nYou can now log in and open the Dashboard.\n');
  } catch (err) {
    console.error('Error creating admin:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

createAdmin();
