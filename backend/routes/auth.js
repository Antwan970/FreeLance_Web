const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (user) => {
  return new Promise((resolve, reject) => {
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    );
  });
};

// Register
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['jobseeker', 'employer']).withMessage('Role must be jobseeker or employer'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email already registered. Please login instead.' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role,
    });

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();
    console.log('User registered successfully:', email);

    // Generate JWT token
    const token = await generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').exists().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { email, password } = req.body;

    // Find user in database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password with hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update login activity
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    console.log('User logged in successfully:', email);

    // Generate JWT token
    const token = await generateToken(user);
    const admin = await Admin.findOne({ userId: user._id, status: 'active' });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: Boolean(admin),
        adminRole: admin?.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user (requires authentication)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

// Get all registered users (admin endpoint)
router.get('/users/list/all', async (req, res) => {
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
    console.error('Get users list error:', err);
    res.status(500).json({ message: 'Server error fetching users list' });
  }
});

// Get login statistics
router.get('/stats/logins', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const jobseekers = await User.countDocuments({ role: 'jobseeker' });
    const employers = await User.countDocuments({ role: 'employer' });
    
    const usersWithLogins = await User.countDocuments({ loginCount: { $gt: 0 } });
    
    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        jobseekers,
        employers,
        usersWithLogins,
        neverLoggedIn: totalUsers - usersWithLogins,
      },
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

module.exports = router;
