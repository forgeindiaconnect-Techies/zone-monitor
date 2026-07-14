const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const { role, companyId: userCompanyId, branch: userBranch } = req.user || {};
    let query = {};

    // Role-based filtering based on Step 4 of user request
    if (role === 'SaaS Super Admin') {
      // SaaS Super Admin only sees platform-level notifications
      query.type = { $in: ['Tenant', 'Subscription', 'System', 'Branch', 'Admin', 'Announcement'] };
    } else if (role === 'Super Admin') {
      // Tenant Super Admin sees everything for their own company
      query.companyId = req.companyId || userCompanyId;
    } else if (role === 'Company Admin' || role === 'Admin') {
      // Admin might just be branch admin in some setups, but here 'Company Admin' -> only their company
      query.companyId = req.companyId || userCompanyId;
    } else if (role === 'Branch Admin' || role === 'Security') {
      // Only their branch activities
      query.companyId = req.companyId || userCompanyId;
      query.branchId = userBranch || req.query.branch;
    } else {
      // Fallback
      query.companyId = req.companyId || userCompanyId;
    }

    // Explicit query overrides
    if (req.query.companyId && role === 'SaaS Super Admin') {
        query.companyId = req.query.companyId;
    }
    
    if (req.query.branchId || req.query.branch) {
      const b = req.query.branchId || req.query.branch;
      if (role === 'SaaS Super Admin' || role === 'Super Admin' || role === 'Company Admin' || role === 'Admin') {
         query.branchId = b;
      }
    }
    
    if (req.query.type) {
      query.type = req.query.type;
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    
    // Safety check if not Super Admin
    if (req.user && req.user.role !== 'SaaS Super Admin' && req.user.role !== 'Super Admin') {
       query.companyId = req.companyId || req.user.companyId;
    }

    const notification = await Notification.findOneAndUpdate(
      query,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { role, companyId: userCompanyId, branch: userBranch } = req.user || {};
    let query = { isRead: false };

    if (role !== 'SaaS Super Admin' && role !== 'Super Admin') {
       query.companyId = req.companyId || userCompanyId;
       if (role === 'Branch Admin' || role === 'Security') {
         query.branchId = userBranch;
       }
    }

    await Notification.updateMany(query, { isRead: true });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    
    if (req.user && req.user.role !== 'SaaS Super Admin' && req.user.role !== 'Super Admin') {
       query.companyId = req.companyId || req.user.companyId;
    }

    const notification = await Notification.findOneAndDelete(query);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.clearAllNotifications = async (req, res) => {
  try {
    const { role, companyId: userCompanyId, branch: userBranch } = req.user || {};
    let query = {};

    if (role !== 'SaaS Super Admin' && role !== 'Super Admin') {
       query.companyId = req.companyId || userCompanyId;
       if (role === 'Branch Admin' || role === 'Security') {
         query.branchId = userBranch;
       }
    }

    await Notification.deleteMany(query);
    res.status(200).json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
