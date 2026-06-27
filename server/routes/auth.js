const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Special hardcoded bootstrap admin to prevent lockout
    if (email === 'admin@example.com' && password === '123456') {
      return res.json({ id: 'bootstrap-admin', name: 'Super Admin', email: 'admin@example.com', role: 'Super Admin', branch: 'All Branches' });
    }
    if (email === 'md@example.com' && password === '123456') {
      return res.json({ id: 'bootstrap-md', name: 'Managing Director', email: 'md@example.com', role: 'MD', branch: 'All Branches' });
    }
    if (email === 'admin@branch.com' && password === '123456') {
      return res.json({ id: 'bootstrap-branch', name: 'Admin User', email: 'admin@branch.com', role: 'Admin', branch: 'Bangalore' });
    }
    if (email === 'security@example.com' && password === '123456') {
      return res.json({ id: 'bootstrap-security', name: 'Gate Security', email: 'security@example.com', role: 'Security', branch: 'Bangalore' });
    }
    if (email === 'visitor@example.com' && password === '123456') {
      return res.json({ id: 'bootstrap-visitor', name: 'Guest Visitor', email: 'visitor@example.com', role: 'Visitor', branch: 'Bangalore' });
    }

    // Find user in MongoDB
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // In a real app, use bcrypt.compare here
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Return user data without password
    const u = user.toJSON();
    delete u.password;
    
    res.json(u);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
