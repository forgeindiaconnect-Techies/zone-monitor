const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Visitor = require('../models/Visitor');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// GET branch summary
router.get('/branch-summary', async (req, res) => {
  try {
    const branch = req.query.branch;
    if (!branch) {
      return res.status(400).json({ message: 'Branch query parameter is required' });
    }

    const security = await User.countDocuments({ companyId: req.companyId, role: 'Security', branch });
    const admins = await User.countDocuments({ companyId: req.companyId, role: { $in: ['Admin', 'Branch Admin', 'MD'] }, branch });
    const visitors = await Visitor.countDocuments({ companyId: req.companyId, branch });

    res.json({ security, admins, visitors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Temp route
router.get('/fix-branches', async (req, res) => {
  try {
    await User.updateMany({ branch: 'Thirupathur' }, { $set: { branch: 'Tirupattur' } });
    await User.updateMany({ branch: 'Dharmapuri (Palakodu)' }, { $set: { branch: 'Salem' } });
    await User.updateMany({ branch: 'Bangalore' }, { $set: { branch: 'Chennai' } });
    
    await Visitor.updateMany({ branch: 'Thirupathur' }, { $set: { branch: 'Tirupattur' } });
    await Visitor.updateMany({ branch: 'Dharmapuri (Palakodu)' }, { $set: { branch: 'Salem' } });
    await Visitor.updateMany({ branch: 'Bangalore' }, { $set: { branch: 'Chennai' } });
    res.json({ message: 'Branches fixed' });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all users
router.get('/', async (req, res) => {
  try {
    let query = { companyId: req.companyId };
    if (req.query.branch) {
      query.branch = req.query.branch;
    }
    const users = await User.find(query).sort({ createdAt: -1 });
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
    const user = await User.findOne({ _id: req.params.id, companyId: req.companyId });
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

    // Force branch if creator role is passed and not Super Admin
    let userBranch = req.body.branch;
    if (req.body.createdByRole && req.body.createdByRole !== 'Super Admin') {
      userBranch = req.body.creatorBranch || req.body.branch;
    }

    // Enforce Plan Limits for Security Staff role
    if (req.body.role === 'Security') {
      const Company = require('../models/Company');
      const company = await Company.findOne({ code: req.companyId });
      if (company) {
        const plan = company.subscription;
        let limit = -1;
        if (plan === 'Basic') limit = 5;
        else if (plan === 'Standard') limit = 20;

        if (limit !== -1) {
          const count = await User.countDocuments({ companyId: req.companyId, role: 'Security' });
          if (count >= limit) {
            return res.status(403).json({ 
              message: `Plan Limit Exceeded: Your current plan (${plan}) only allows up to ${limit} security staff members. Please upgrade to add more.` 
            });
          }
        }
      }
    }

    const user = new User({
      companyId: req.companyId,
      name: req.body.name,
      email: req.body.email,
      mobileNumber: req.body.mobileNumber,
      password: req.body.password, // Plain text as requested for testing
      role: req.body.role,
      branch: userBranch,
      status: req.body.status || 'Active',
      createdBy: req.body.createdBy
    });

    const newUser = await user.save();
    
    // Trigger Notification for User added
    if (newUser.role === 'Admin' || newUser.role === 'Branch Admin' || newUser.role === 'Security') {
      const Notification = require('../models/Notification');
      const typeStr = newUser.role === 'Security' ? 'Security' : 'Admin';
      const titleStr = newUser.role === 'Security' ? '👮 Security Added' : '👤 Admin Added';
      const newNotification = await Notification.create({
        companyId: req.companyId,
        branchId: newUser.branch,
        type: typeStr,
        title: titleStr,
        message: `${newUser.name} was added as ${newUser.role} for ${newUser.branch} Branch.`,
        createdBy: req.body.createdBy || 'System'
      });
      const io = req.app.get('io');
      if (io) {
        io.emit('new_notification', newNotification);
      }
    }

    const u = newUser.toJSON();
    delete u.password;
    res.status(201).json(u);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update user
router.patch('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      { $set: req.body },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    
    const u = updatedUser.toJSON();
    delete u.password;
    res.json(u);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE user (or soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, companyId: req.companyId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
