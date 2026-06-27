const mongoose = require('mongoose');

const visitorProfileSchema = new mongoose.Schema({
  profileId: { type: String, unique: true, required: true },
  mobileNumber: { type: String, unique: true, required: true },
  visitorName: { type: String, required: true },
  email: { type: String },
  companyName: { type: String },
  photoUrl: { type: String }
}, { timestamps: true });

visitorProfileSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

module.exports = mongoose.model('VisitorProfile', visitorProfileSchema);