const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  driverImage: String,
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  LanguagePreferred: { type: String, required: true},
  vehicleImage: String,
  vehicleType: String,
  drivingLicenseImage: String,
  aadharCardImage: String,
  vehicleRCImage: String,
  vehicleInsuranceImage: String,
  registerFeesAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isVerified: { type: Boolean, default: false },
}, {
  timestamps: true
});

module.exports = mongoose.model('Driver', driverSchema);
