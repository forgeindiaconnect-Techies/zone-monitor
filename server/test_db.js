const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/zmvms').then(async () => {
  const Visitor = mongoose.model('Visitor', new mongoose.Schema({}, { strict: false }));
  const v = await Visitor.find({ visitorName: { $regex: /sabari/i } });
  console.log("Visitors:", v);
  process.exit(0);
});
