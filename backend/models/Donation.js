const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: String,
      default: '',
    },
    donor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    donor_name: {
      type: String,
      default: 'Anonymous Donor',
    },
    donor_phone: {
      type: String,
      default: '',
    },
    food_name: {
      type: String,
      required: [true, 'Food name is required'],
    },
    category: {
      type: String,
      default: 'Cooked Meals',
    },
    description: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 1,
    },
    unit: {
      type: String,
      default: 'Kg',
    },
    prepDate: {
      type: String,
      default: '',
    },
    expiryTime: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      required: [true, 'Pickup address is required'],
    },
    pickupLocation: {
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
    deliveryPreference: {
      type: String,
      default: 'VOLUNTEER_DELIVERY',
    },
    deliveryMode: {
      type: String,
      default: 'VOLUNTEER_DELIVERY',
    },
    volunteerRequired: {
      type: Boolean,
      default: true,
    },
    volunteerStatus: {
      type: String,
      default: 'PENDING',
    },
    intendedRecipient: {
      type: String,
      enum: ['NGO', 'RECEIVER', 'ALL'],
      default: 'ALL',
    },
    collectionMethod: {
      type: String,
      default: 'VOLUNTEER_DELIVERY',
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'REQUESTED',
        'ACCEPTED',
        'ACCEPTED_SELF_COLLECTION',
        'APPROVED',
        'VOLUNTEER_ASSIGNED',
        'PICKUP_STARTED',
        'PICKED_UP',
        'IN_TRANSIT',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED',
      ],
      default: 'PENDING',
    },
    requests: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        userRole: String, // 'NGO' or 'RECEIVER'
        collectionMethod: String,
        distanceKm: Number,
        requestTime: { type: Date, default: Date.now },
        status: { type: String, default: 'PENDING' }, // 'PENDING', 'ACCEPTED', 'REJECTED'
      },
    ],
    claimedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      role: String,
      phone: String,
      address: String,
    },
    recipientPhone: {
      type: String,
      default: '',
    },
    recipientAddress: {
      type: String,
      default: '',
    },
    pickupFormattedAddress: { type: String, default: '' },
    pickupLatitude: { type: Number },
    pickupLongitude: { type: Number },
    pickupPlaceId: { type: String, default: '' },
    recipientFormattedAddress: { type: String, default: '' },
    recipientLatitude: { type: Number },
    recipientLongitude: { type: Number },
    recipientPlaceId: { type: String, default: '' },
    volunteerPhone: {
      type: String,
      default: '',
    },
    ngo_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    acceptedByNGO: {
      type: String,
      default: '',
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    acceptedByReceiver: {
      type: String,
      default: '',
    },
    volunteer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedVolunteer: {
      type: String,
      default: '',
    },
    pickupProofImage: {
      type: String,
      default: '',
    },
    deliveryProofImage: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewComment: {
      type: String,
      default: '',
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        updatedBy: String,
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

donationSchema.index({ pickupLocation: '2dsphere' });

module.exports = mongoose.model('Donation', donationSchema);
