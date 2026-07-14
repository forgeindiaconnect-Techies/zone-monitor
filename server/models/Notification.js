const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      index: true
    },
    branchId: {
      type: String,
    },
    type: {
      type: String,
      required: true,
      enum: ['Tenant', 'Visitor', 'Security', 'Attendance', 'Subscription', 'System', 'Announcement', 'Branch', 'Admin'],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
    },
    roles: [
      {
        type: String,
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
