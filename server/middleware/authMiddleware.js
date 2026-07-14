const Company = require('../models/Company');

module.exports = async (req, res, next) => {
  try {
    const companyId = req.headers['x-company-id'];
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    // Resolve tenant companyId
    if (companyId) {
      const company = await Company.findOne({ code: companyId.toUpperCase() });
      if (!company) {
        return res.status(404).json({ message: 'Company code is invalid' });
      }

      if (company.status !== 'Active' && userRole !== 'SaaS Super Admin') {
        return res.status(403).json({ 
          message: `Your subscription account status is '${company.status}'. Please contact system administrator.` 
        });
      }

      // Check if subscription has expired
      if (company.subscriptionExpiresAt && new Date() > new Date(company.subscriptionExpiresAt) && userRole !== 'SaaS Super Admin') {
        return res.status(403).json({ 
          message: `Your subscription has expired on ${new Date(company.subscriptionExpiresAt).toLocaleDateString()}. Please renew to continue.` 
        });
      }

      req.companyId = companyId.toUpperCase();
    } else {
      // Default fallback for legacy endpoints or unconfigured requests
      req.companyId = 'FIC001';
    }

    req.userId = userId || null;
    req.userRole = userRole || null;

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: 'Internal Server Error in authentication' });
  }
};
