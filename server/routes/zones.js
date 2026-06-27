const express = require('express');
const router = express.Router();
const Zone = require('../models/Zone');

// GET all zones
router.get('/', async (req, res) => {
  try {
    const zones = await Zone.find().sort({ createdAt: -1 });
    res.json(zones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new zone
router.post('/', async (req, res) => {
  const zone = new Zone(req.body);
  try {
    const newZone = await zone.save();
    res.status(201).json(newZone);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH a zone (update)
router.patch('/:id', async (req, res) => {
  try {
    const updatedZone = await Zone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedZone) return res.status(404).json({ message: 'Zone not found' });
    res.json(updatedZone);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a zone
router.delete('/:id', async (req, res) => {
  try {
    const zone = await Zone.findByIdAndDelete(req.params.id);
    if (!zone) return res.status(404).json({ message: 'Zone not found' });
    res.json({ message: 'Zone deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
