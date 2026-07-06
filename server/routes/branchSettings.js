const express = require('express');
const router = express.Router();
const BranchSetting = require('../models/BranchSetting');

// GET all branch settings
router.get('/', async (req, res) => {
  try {
    const settings = await BranchSetting.find();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET specific branch setting
router.get('/:branchName', async (req, res) => {
  try {
    const setting = await BranchSetting.findOne({ 
      branchName: { $regex: new RegExp(`^${req.params.branchName}$`, 'i') } 
    });
    if (!setting) {
      return res.status(404).json({ message: 'Branch settings not found' });
    }
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST/PUT update branch setting
router.post('/', async (req, res) => {
  try {
    const { branchName, latitude, longitude, radius, checkInStart, checkInEnd, checkOutTime } = req.body;
    
    // Upsert the setting
    const setting = await BranchSetting.findOneAndUpdate(
      { branchName: { $regex: new RegExp(`^${branchName}$`, 'i') } },
      {
        branchName,
        latitude,
        longitude,
        radius,
        checkInStart,
        checkInEnd,
        checkOutTime
      },
      { new: true, upsert: true }
    );
    
    res.json(setting);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
