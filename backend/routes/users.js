const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Update user profile
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this profile' });
    }

    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const { name, profile } = req.body;
    if (name) user.name = name;
    if (profile) user.profile = { ...user.profile, ...profile };

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;