
const jwt = require('jsonwebtoken');
const User = require('../../model/user/UserAuth');
const client = require('../../config/twilio');

const otpStore = {}; // Temporary. Use Redis/DB in prod

exports.register = async (req, res) => {
  const { name, email, contactNumber } = req.body;
  try {
    if (!name || !email || !contactNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    let user = await User.findOne({ contactNumber });
    if (!user) {
      user = await User.create({ name, email, contactNumber });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    const fullPhone = `+91${contactNumber}`;
  
    console.log("Sending OTP:", otp, "To:", fullPhone);
  
    const response = await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: fullPhone,
    });
  
    console.log("Twilio Message SID:", response.sid);
    otpStore[user._id] = otp;
  
    res.status(200).json({ message: 'OTP sent', userId: user._id });
  } catch (err) {
    console.error("Twilio Error:", err.message);
    return res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
}

exports.verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const storedOtp = otpStore[userId];
    if (!storedOtp || storedOtp != otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findByIdAndUpdate(userId, { isVerified: true }, { new: true });
    delete otpStore[userId];

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ message: 'OTP verified', token, user });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ message: 'OTP verification failed' });
  }
};

exports.resendOTP = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(1000 + Math.random() * 9000);
    const fullPhone = `+91${user.contactNumber}`;

    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: fullPhone,
    });

    otpStore[user._id] = otp;

    res.status(200).json({ message: 'OTP resent' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
};

exports.login = async (req, res) => {
  const { contactNumber } = req.body;

  try {
    const user = await User.findOne({ contactNumber });

    // if (!user || !user.isVerified) {
    if (!user ) {
      return res.status(403).json({ message: 'User not found or not verified' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    const fullPhone = `+91${contactNumber}`;

    await client.messages.create({
      body: `Your login OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: fullPhone,
    });

    otpStore[user._id] = otp;

    res.status(200).json({ message: 'OTP sent for login', userId: user._id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};
