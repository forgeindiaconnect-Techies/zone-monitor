const mongoose = require('mongoose');

async function update() {
  await mongoose.connect('mongodb+srv://zone:zone12@cluster0.qpt2tel.mongodb.net/?appName=Cluster0');
  const Visitor = require('./models/Visitor');
  await Visitor.updateMany({}, { $set: { branch: 'Thirupathur' } });
  console.log('Updated remote db');
  process.exit(0);
}

update();
