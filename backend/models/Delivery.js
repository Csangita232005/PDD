const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    recipientRole: {
      type: String,
      default: 'RECEIVER',
    },
    deliveryType: {
      type: String,
      default: 'VOLUNTEER_DELIVERY',
    },
    volunteerRequired: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REQUESTED', 'VOLUNTEER_ASSIGNED', 'PICKUP_STARTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    pickupAddress: { type: String, default: '' },
    pickupLatitude: { type: Number },
    pickupLongitude: { type: Number },
    pickupFormattedAddress: { type: String, default: '' },
    deliveryAddress: { type: String, default: '' },
    deliveryLatitude: { type: Number },
    deliveryLongitude: { type: Number },
    deliveryFormattedAddress: { type: String, default: '' },
    volunteerLatitude: { type: Number },
    volunteerLongitude: { type: Number },
    volunteerLocationUpdatedAt: { type: Date },
    pickupProofImage: { type: String, default: '' },
    deliveryProofImage: { type: String, default: '' },
    pickupTime: { type: Date },
    deliveryTime: { type: Date },
    completedTime: { type: Date },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [78.4867, 17.3850],
      },
    },
    foodQualityRating: { type: Number, default: 5 },
    feedback: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

deliverySchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Delivery', deliverySchema);
