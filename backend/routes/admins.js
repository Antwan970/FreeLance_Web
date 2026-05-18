const express = require('express');
const User = require('../models/User');
const Admin = require('../models/Admin');
const auth = require('../middleware/auth');

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ userId: req.user.id });
    if (!admin || admin.status !== 'active') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.admin = admin;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error checking admin status' });
  }
};

// Get admin dashboard data
router.get('/dashboard', auth, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const jobseekers = await User.countDocuments({ role: 'jobseeker' });
    const employers = await User.countDocuments({ role: 'employer' });
    const usersWithLogins = await User.countDocuments({ loginCount: { $gt: 0 } });
    const totalAdmins = await Admin.countDocuments({ status: 'active' });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        jobseekers,
        employers,
        usersWithLogins,
        neverLoggedIn: totalUsers - usersWithLogins,
        totalAdmins,
      },
      adminInfo: {
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role,
        permissions: req.admin.permissions,
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Server error fetching dashboard' });
  }
});

// Get all users (admin only)
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalUsers: users.length,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        registeredAt: user.createdAt,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount,
        isActive: user.isActive,
      })),
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Create new admin
router.post('/create', auth, isAdmin, async (req, res) => {
  try {
    // Only superadmin can create admins
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can create admins' });
    }

    const { userId, role } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already admin
    const existingAdmin = await Admin.findOne({ userId });
    if (existingAdmin) {
      return res.status(400).json({ message: 'User is already an admin' });
    }

    // Create admin
    const admin = new Admin({
      userId,
      name: user.name,
      email: user.email,
      role: role || 'admin',
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
      },
    });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ message: 'Server error creating admin' });
  }
});

// Get all admins
router.get('/list', auth, isAdmin, async (req, res) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalAdmins: admins.length,
      admins: admins.map(admin => ({
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        permissions: admin.permissions,
        lastLogin: admin.lastAdminLogin,
        loginCount: admin.adminLoginCount,
        createdAt: admin.createdAt,
      })),
    });
  } catch (err) {
    console.error('Get admins error:', err);
    res.status(500).json({ message: 'Server error fetching admins' });
  }
});

// Update admin permissions
router.put('/:adminId/permissions', auth, isAdmin, async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can modify permissions' });
    }

    const { permissions } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      req.params.adminId,
      { permissions },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Permissions updated',
      admin,
    });
  } catch (err) {
    console.error('Update permissions error:', err);
    res.status(500).json({ message: 'Server error updating permissions' });
  }
});

// Remove admin
router.delete('/:adminId', auth, isAdmin, async (req, res) => {
  try {
    if (req.admin.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can remove admins' });
    }

    const admin = await Admin.findByIdAndDelete(req.params.adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Admin removed successfully',
    });
  } catch (err) {
    console.error('Delete admin error:', err);
    res.status(500).json({ message: 'Server error deleting admin' });
  }
});

// Track admin login
router.post('/login-track', auth, async (req, res) => {
  try {
    const admin = await Admin.findOne({ userId: req.user.id });
    if (!admin) {
      return res.status(403).json({ message: 'Not an admin user' });
    }

    // Update admin login info
    admin.lastAdminLogin = new Date();
    admin.adminLoginCount = (admin.adminLoginCount || 0) + 1;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Login tracked',
    });
  } catch (err) {
    console.error('Track login error:', err);
    res.status(500).json({ message: 'Server error tracking login' });
  }
});

module.exports = router;
