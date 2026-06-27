const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/zmvms')
  .then(async () => {
    console.log('Connected. Running migration...');
    const db = mongoose.connection.db;
    
    // Update Visitors
    const vRes = await db.collection('visitors').updateMany(
      { branch: 'Chennai Branch' },
      { $set: { branch: 'Bangalore' } }
    );
    console.log(`Updated ${vRes.modifiedCount} visitors to Bangalore`);

    // Update Users
    const uRes = await db.collection('users').updateMany(
      { branch: 'Chennai Branch' },
      { $set: { branch: 'Bangalore' } }
    );
    console.log(`Updated ${uRes.modifiedCount} users to Bangalore`);

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
