const express = require('express');
const { register, verifyOTP, resendOTP, login } = require('../../controller/user/userController');
const router = express.Router();


router.post('/register',register);
router.post('/verify', verifyOTP);
router.post('/resend', resendOTP);
router.post('/login', login);

module.exports = router;
