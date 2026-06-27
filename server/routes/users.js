const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    // Remove passwords before sending to frontend
    const sanitizedUsers = users.map(user => {
      const u = user.toJSON();
      delete u.password;
      return u;
    });
    res.json(sanitizedUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const u = user.toJSON();
    delete u.password;
    res.json(u);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new user
router.post('/', async (req, res) => {
  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password, // Plain text as requested for testing
      role: req.body.role,
      branch: req.body.branch,
      status: req.body.status || 'Active',
      createdBy: req.body.createdBy
    });

    const newUser = await user.save();
    
    const u = newUser.toJSON();
    delete u.password;
    res.status(201).json(u);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH delete user (or soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
