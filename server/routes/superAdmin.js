const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const User = require('../models/User');
const Visitor = require('../models/Visitor');
const authMiddleware = require('../middleware/authMiddleware');

// Require SaaS Super Admin role for all super-admin endpoints
router.use(authMiddleware);
router.use((req, res, next) => {
  if (req.userRole !== 'SaaS Super Admin') {
    return res.status(403).json({ message: 'Forbidden: SaaS Super Admin access required' });
  }
  next();
});

// GET all companies (with counts)
router.get('/companies', async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    
    const enriched = [];
    for (const comp of companies) {
      const userCount = await User.countDocuments({ companyId: comp.code });
      const visitorCount = await Visitor.countDocuments({ companyId: comp.code });
      enriched.push({
        ...comp.toJSON(),
        _id: comp._id.toString(),  // Explicitly include _id for frontend operations
        userCount,
        visitorCount
      });
    }
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH update company details
router.patch('/companies/:id', async (req, res) => {
  try {
    const { subscription, status, subscriptionExpiresAt } = req.body;
    const comp = await Company.findById(req.params.id);
    if (!comp) return res.status(404).json({ message: 'Company not found' });

    let statusChanged = false;
    let subscriptionChanged = false;

    if (subscription !== undefined && comp.subscription !== subscription) {
      comp.subscription = subscription;
      subscriptionChanged = true;
    }
    if (status !== undefined && comp.status !== status) {
      comp.status = status;
      statusChanged = true;
    }
    if (subscriptionExpiresAt !== undefined) {
      comp.subscriptionExpiresAt = subscriptionExpiresAt;
    }

    await comp.save();

    // Trigger Notifications for SaaS Super Admin
    const Notification = require('../models/Notification');
    const io = req.app.get('io');
    
    if (statusChanged) {
      const typeStr = status === 'Active' ? 'Subscription Activated' : 'Subscription Deactivated';
      const icon = status === 'Active' ? '✅' : '❌';
      const newNotif = await Notification.create({
        companyId: 'SYSTEM',
        type: 'Subscription',
        title: `${icon} ${typeStr}`,
        message: `${comp.name} subscription has been ${status.toLowerCase()}.`,
        createdBy: req.userRole || 'System'
      });
      if (io) io.emit('new_notification', newNotif);
    } else if (subscriptionChanged) {
      const newNotif = await Notification.create({
        companyId: 'SYSTEM',
        type: 'Subscription',
        title: '💳 Subscription Updated',
        message: `${comp.name} updated to ${subscription} plan.`,
        createdBy: req.userRole || 'System'
      });
      if (io) io.emit('new_notification', newNotif);
    } else {
      const newNotif = await Notification.create({
        companyId: 'SYSTEM',
        type: 'Tenant',
        title: '🏢 Tenant Updated',
        message: `${comp.name} details have been updated.`,
        createdBy: req.userRole || 'System'
      });
      if (io) io.emit('new_notification', newNotif);
    }

    res.json(comp);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE company and all associated data (cascade delete)
router.delete('/companies/:id', async (req, res) => {
  try {
    const comp = await Company.findById(req.params.id);
    if (!comp) return res.status(404).json({ message: 'Company not found' });

    // Protect system-level companies from deletion
    if (comp.code === 'SYSTEM' || comp.code === 'FIC001') {
      return res.status(403).json({ message: `The '${comp.code}' company cannot be deleted as it is a system-protected tenant.` });
    }

    const Blacklist = require('../models/Blacklist');
    const Zone = require('../models/Zone');
    const Notification = require('../models/Notification');

    // Cascade-delete all data belonging to this tenant
    await Promise.all([
      User.deleteMany({ companyId: comp.code }),
      Visitor.deleteMany({ companyId: comp.code }),
      Blacklist.deleteMany({ companyId: comp.code }).catch(() => {}),
      Zone.deleteMany({ companyId: comp.code }).catch(() => {}),
      Notification.deleteMany({ companyId: comp.code }).catch(() => {}),
    ]);

    await Company.findByIdAndDelete(req.params.id);

    // Trigger Notification for Tenant Deleted
    const newNotification = await Notification.create({
      companyId: 'SYSTEM',
      type: 'Tenant',
      title: '🗑 Tenant Deleted',
      message: `${comp.name} has been deleted.`,
      createdBy: req.userRole || 'System'
    });
    const io = req.app.get('io');
    if (io) {
      io.emit('new_notification', newNotification);
    }

    res.json({ message: `Company '${comp.name}' (${comp.code}) and all its data have been permanently deleted.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET platform analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const activeCompanies = await Company.countDocuments({ status: 'Active' });
    const inactiveCompanies = await Company.countDocuments({ status: { $ne: 'Active' } });

    // Platform-wide visitor count
    const totalVisitors = await Visitor.countDocuments();

    // Mock revenue metrics based on active subscriptions
    const standardCount = await Company.countDocuments({ status: 'Active', subscription: 'Standard' });
    const enterpriseCount = await Company.countDocuments({ status: 'Active', subscription: 'Enterprise' });

    const monthlyRevenue = (standardCount * 29) + (enterpriseCount * 99);
    const annualRevenue = monthlyRevenue * 12;

    res.json({
      totalCompanies,
      activeCompanies,
      inactiveCompanies,
      totalVisitors,
      monthlyRevenue,
      annualRevenue,
      tiers: {
        OneDayTrial: await Company.countDocuments({ subscription: 'One Day Trial' }),
        Basic: await Company.countDocuments({ subscription: 'Basic' }),
        Standard: await Company.countDocuments({ subscription: 'Standard' }),
        Enterprise: await Company.countDocuments({ subscription: 'Enterprise' })
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
