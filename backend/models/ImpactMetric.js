const mongoose = require('mongoose');

const impactMetricSchema = new mongoose.Schema(
  {
    month: {
      type: String, // e.g. "2026-08"
      required: true,
      unique: true,
    },
    totalDonations: { type: Number, default: 0 },
    completedDonations: { type: Number, default: 0 },
    totalFoodSavedKg: { type: Number, default: 0 },
    totalMealsServed: { type: Number, default: 0 },
    totalPeopleHelped: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ImpactMetric', impactMetricSchema);
