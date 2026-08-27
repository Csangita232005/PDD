const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const roleAddressSchema = new mongoose.Schema({
  formattedAddress: { type: String, default: '' },
  addressLine: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pinCode: { type: String, default: '' },
  country: { type: String, default: 'India' },
  latitude: { type: Number, default: 17.3850 },
  longitude: { type: Number, default: 78.4867 },
  placeId: { type: String, default: '' },
}, { _id: false });

const roleProfilesSchema = new mongoose.Schema({
  donor: {
    isRegistered: { type: Boolean, default: false },
    completedAt: { type: Date },
    donorType: { type: String, default: 'Individual' },
    address: { type: roleAddressSchema, default: () => ({}) },
  },
  ngo: {
    isRegistered: { type: Boolean, default: false },
    completedAt: { type: Date },
    organizationName: { type: String, default: '' },
    registrationNo: { type: String, default: '' },
    serviceArea: { type: String, default: '' },
    capacity: { type: Number, default: 100 },
    address: { type: roleAddressSchema, default: () => ({}) },
  },
  beneficiary: {
    isRegistered: { type: Boolean, default: false },
    completedAt: { type: Date },
    householdSize: { type: Number, default: 1 },
    receiverType: { type: String, default: 'Individual' },
    address: { type: roleAddressSchema, default: () => ({}) },
  },
  volunteer: {
    isRegistered: { type: Boolean, default: false },
    completedAt: { type: Date },
    vehicleType: { type: String, default: 'Bike' },
    availability: { type: String, default: 'Full-time' },
    address: { type: roleAddressSchema, default: () => ({}) },
  },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 4,
    },
    mobile: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['DONOR', 'NGO', 'VOLUNTEER', 'RECEIVER', 'ADMIN'],
      default: 'DONOR',
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    adminAccess: {
      type: Boolean,
      default: false,
    },
    setupCompleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verifiedStatus: {
      type: Boolean,
      default: true,
    },
    roleProfiles: {
      type: roleProfilesSchema,
      default: () => ({
        donor: { address: {} },
        ngo: { address: {} },
        beneficiary: { address: {} },
        volunteer: { address: {} },
      }),
    },
    address: {
      type: String,
      default: '',
    },
    donorAddress: {
      type: String,
      default: '',
    },
    ngoAddress: {
      type: String,
      default: '',
    },
    receiverAddress: {
      type: String,
      default: '',
    },
    volunteerAddress: {
      type: String,
      default: '',
    },
    formattedAddress: {
      type: String,
      default: '',
    },
    addressLine: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    state: {
      type: String,
      default: '',
    },
    pinCode: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: 'India',
    },
    latitude: {
      type: Number,
      default: 17.3850,
    },
    longitude: {
      type: Number,
      default: 78.4867,
    },
    placeId: {
      type: String,
      default: '',
    },
    locationUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    donorType: {
      type: String,
      default: 'Individual',
    },
    organizationName: {
      type: String,
      default: '',
    },
    contactPersonName: {
      type: String,
      default: '',
    },
    registrationNo: {
      type: String,
      default: '',
    },
    serviceArea: {
      type: String,
      default: '',
    },
    capacity: {
      type: Number,
      default: 100,
    },
    householdSize: {
      type: Number,
      default: 1,
    },
    receiverType: {
      type: String,
      default: '',
    },
    vehicleType: {
      type: String,
      default: '',
    },
    availability: {
      type: String,
      default: 'Full-time',
    },
    location: {
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
  },
  {
    timestamps: true,
  }
);

userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
