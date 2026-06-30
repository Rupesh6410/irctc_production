const express = require('express');
const router = express.Router();

const {sendOTP, verifyOTP, rotateRefreshToken, login} = require('../controllers/auth.controller');

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/refresh-token', rotateRefreshToken);
router.post('/login', login);

module.exports = router;