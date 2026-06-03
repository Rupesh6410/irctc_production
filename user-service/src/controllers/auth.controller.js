const { BadRequestError, UnauthorizedError } = require("../utils/error");
const asyncHandler = require('../utils/asyncHandler');
const {config} = require('../config');
const authService = require('../services/auth.service');

exports.sendOtp = asyncHandler(async (req, res) => {
    const {firstname , lastname , email , password , confirmPassword} = req.body;
    if (!firstname || !lastname || !email || !password || !confirmPassword) {
        throw new BadRequestError("All fields are required");
    }
    if(password!=confirmPassword){
        throw new BadRequestError("Password and confirm password do not match");
    }
    const {otpSessionId}= await authService.sendOtp(firstname, lastname, email, password);
    res.cookie("otp_session", otpSessionId, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: config.OTP_TTL * 1000 // 
    }).status(200).json({
        success: true,
        message: "OTP sent successfully"
    });

    
})