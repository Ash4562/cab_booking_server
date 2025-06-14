// routes/driverRoutes.js
const express = require('express');
const { registerDriver, updateDriverStatus, login, verifyOTP } = require('../../controller/driver/driverAuthController');
const upload = require('../../middleware/multer');
const router = express.Router();


router.post(
  '/register',
  upload.fields([
    { name: 'driverImage', maxCount: 1 },
    { name: 'vehicleImage', maxCount: 1 },
    { name: 'drivingLicenseImage', maxCount: 1 },
    { name: 'aadharCardImage', maxCount: 1 },
    { name: 'vehicleRCImage', maxCount: 1 },
    { name: 'vehicleInsuranceImage', maxCount: 1 },
  ]),registerDriver);
router.put('/byAdmin/statusCheck/:id', updateDriverStatus);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);


module.exports = router;
