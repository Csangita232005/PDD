const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedDonationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
    },
    type: {
      type: String,
      enum: ['DONATION_NEARBY', 'DONATION_REQUESTED', 'REQUEST_APPROVED', 'VOLUNTEER_ASSIGNED', 'STATUS_UPDATE', 'DELIVERED', 'COMPLETED', 'GENERAL'],
      default: 'GENERAL',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
