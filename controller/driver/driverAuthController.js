

const client = require("../../config/twilio");
const DriverAuth = require("../../model/driver/DriverAuth");
const jwt = require("jsonwebtoken");
exports.registerDriver = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      vehicleType,
      registerFeesAmount,LanguagePreferred
    } = req.body;

    const {
      driverImage,
      vehicleImage,
      drivingLicenseImage,
      aadharCardImage,
      vehicleRCImage,
      vehicleInsuranceImage
    } = req.files;

    const newDriver = new DriverAuth({
      driverImage: driverImage[0].path,
      fullName,
      phone,
      email,
      vehicleImage: vehicleImage[0].path,
      LanguagePreferred,
      vehicleType,
      drivingLicenseImage: drivingLicenseImage[0].path,
      aadharCardImage: aadharCardImage[0].path,
      vehicleRCImage: vehicleRCImage[0].path,
      vehicleInsuranceImage: vehicleInsuranceImage[0].path,
      registerFeesAmount,
    });

    await newDriver.save();

    res.status(201).json({ message: 'Driver registered successfully', driver: newDriver });
  } catch (error) {
    console.error('Driver registration failed:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};
const otpStore = {}; // Or use DB/session in production

exports.updateDriverStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const driver = await DriverAuth.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!driver) return res.status(404).json({ error: 'Driver not found' });

    res.status(200).json({ message: `Driver ${status} successfully`, driver });
  } catch (error) {
    console.error('Status update failed:', error);
    res.status(500).json({ error: 'Failed to update driver status' });
  }
};

exports.login = async (req, res) => {
  const { phone } = req.body;

  try {
    if (!phone || phone.length !== 10) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit phone number.' });
    }

    const driver = await DriverAuth.findOne({ phone });

    if (!driver) {
      return res.status(404).json({ message: 'No driver found. Please enter a registered phone number.' });
    }

    if (driver.status !== 'approved') {
      return res.status(403).json({ message: 'Your registration is not approved yet.' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    const fullPhone = `+91${phone}`;

    console.log("Sending OTP to:", fullPhone, "| OTP:", otp);

    await client.messages.create({
      body: `Your OTP for login is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: fullPhone,
    });

    // ✅ Store OTP temporarily
    otpStore[driver._id] = otp;

    res.status(200).json({ message: 'OTP sent successfully', driverId: driver._id });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};


exports.verifyOTP = async (req, res) => {
  try {
    const { driverId, otp } = req.body;

    if (!driverId || !otp) {
      console.log("Missing driverId or OTP");
      return res.status(400).json({ message: 'Missing driverId or OTP' });
    }

    console.log("Verifying OTP for driverId:", driverId, " | OTP:", otp);

    const storedOtp = otpStore[driverId];
    console.log("Stored OTP:", storedOtp);

    if (!storedOtp || parseInt(otp) !== storedOtp) {
      console.log("Invalid or expired OTP");
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Generate token
    const token = jwt.sign({ id: driverId }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    delete otpStore[driverId];

    return res.status(200).json({ message: 'Login successful' });

  } catch (error) {
    console.error('OTP verification failed:', error.message);
    console.error(error.stack); // 🔍 print full trace
    res.status(500).json({ message: 'Internal server error' });
  }
};




































// exports.login = async (req, res) => {
//   const { phone } = req.body;

//   try {
//     if (!phone || phone.length !== 10) {
//       return res.status(400).json({ message: 'Please provide a valid 10-digit phone number.' });
//     }

//     const driver = await DriverAuth.findOne({ phone });

//     if (!driver) {
//       return res.status(404).json({ message: 'No driver found. Please enter a registered phone number.' });
//     }

//     if (driver.status !== 'approved') {
//       return res.status(403).json({ message: 'Your registration is not approved yet.' });
//     }

//     const otp = Math.floor(1000 + Math.random() * 9000);
//     const fullPhone = phone.startsWith('+') ? phone : `+91${phone}`;

//     console.log("Sending OTP to:", fullPhone, "| OTP:", otp);

//     await client.messages.create({
//       body: `Your OTP for login is: ${otp}`,
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to: fullPhone,
//     });

//     otpStore[driver._id] = otp; // Use DB or Redis in real project

//     res.status(200).json({ message: 'OTP sent successfully', driverId: driver._id });
//   } catch (error) {
//     console.error('Error sending OTP:', error);
//     res.status(500).json({ message: 'Failed to send OTP' });
//   }
// };





  // exports.verifyOTP = async (req, res) => {
  //   const { phone, otp } = req.body;
  
  //   try {
  //     const driver = await DriverAuth.findOne({ phone });
  
  //     if (!driver || driver.status !== 'approved') {
  //       return res.status(403).json({ message: 'Not allowed to login' });
  //     }
  
  //     const verificationCheck = await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
  //       .verificationChecks
  //       .create({
  //         to: `+91${phone}`,
  //         code: otp
  //       });
  
  //     if (verificationCheck.status === 'approved') {
  //       // Login success – you can generate JWT here
  //       res.status(200).json({
  //         message: 'Login successful',
  //         driver: {
  //           id: driver._id,
  //           fullName: driver.fullName,
  //           phone: driver.phone,
  //           email: driver.email
  //         }
  //       });
  //     } else {
  //       res.status(401).json({ message: 'Invalid OTP' });
  //     }
  //   } catch (error) {
  //     console.error('OTP verification failed:', error);

  //     res.status(500).json({ message: 'Failed to verify OTP' });
  //   }
  // };
  

  // exports.login = async (req, res) => {
  //   const { phone } = req.body;
  
  //   try {
  //     if (!phone || phone.length !== 10) {
  //       return res.status(400).json({ message: 'Please provide a valid 10-digit phone number.' });
  //     }
  
  //     const driver = await DriverAuth.findOne({ phone });
  
  //     if (!driver) {
  //       return res.status(404).json({ message: 'No driver found. Please enter a registered phone number.' });
  //     }
  
  //     if (driver.status !== 'approved') {
  //       return res.status(403).json({ message: 'Your registration is not approved yet.' });
  //     }
  
  //     const otp = Math.floor(1000 + Math.random() * 9000);
  //     const fullPhone = phone.startsWith('+') ? phone : `+91${phone}`;
  
  //     console.log("Sending OTP to:", fullPhone, "| OTP:", otp);
  
  //     await client.messages.create({
  //       body: `Your OTP for login is: ${otp}`,
  //       from: process.env.TWILIO_PHONE_NUMBER,
  //       to: fullPhone,
  //     });
  
  //     otpStore[driver._id] = otp; // Use DB or Redis in real project
  
  //     res.status(200).json({ message: 'OTP sent successfully', driverId: driver._id });
  //   } catch (error) {
  //     console.error('Error sending OTP:', error);
  //     res.status(500).json({ message: 'Failed to send OTP' });
  //   }
  // };
  // exports.verifyOTP = async (req, res) => {
  //   const { phone, otp } = req.body;
  //   try {
  //     // Validate phone format (optional but recommended)
  //     console.log(req.body);
  //     const cleanedPhone = phone.replace(/[^0-9]/g, '');
  //     if (cleanedPhone.length !== 10) {
  //       return res.status(400).json({ message: 'Invalid phone number format' });
  //     }
  //     console.log("cleanedPhone",cleanedPhone);
  
  //     // Twilio OTP Verification
  //     console.log("verificationCheckID",process.env.TWILIO_SERVICE_SID);
  //     const verificationCheck = await client.verify.v2
  //     .services(process.env.TWILIO_SERVICE_SID)
  //     .verificationChecks.create({
  //       to: phone,
  //       code: otp,
  //     });
  //       console.log("verificationCheck",verificationCheck);
  
  
  //     if (verificationCheck.status === 'approved') {
  //       return res.status(200).json({ message: 'OTP verified successfully' });
  //     } else {
  //       return res.status(401).json({ message: 'Invalid OTP' });
  //     }
  //   } catch (error) {
  //     console.error('OTP verification failed:', error);
  //     res.status(500).json({ message: 'Failed to verify OTP' });
  //   }
  // };
  