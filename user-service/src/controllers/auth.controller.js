const { BadRequestError, UnauthorizedError } = require("../utils/error");
const asyncHandler = require('../utils/asyncHandler');
const {config} = require('../config');
const authService = require('../services/auth.service');

exports.sendOTP = asyncHandler(async (req, res) => {
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
exports.verifyOTP = asyncHandler(async(req ,res)=>{
    const {otp}= req.body;
    const otpSessionId = req.cookies.otp_session;
    if (!otpSessionId || !otp){
        throw new BadRequestError("OTP or session ID is missing");
    }
    // TODO: Verify OTP and create user
    const user= await authService.verifyOTP(otp, otpSessionId);
    res.clearCookie("otp_session")
    res.status(200).json({
        success: true,
        message: "User created successfully",
        data: user
    })

})
exports.login = asyncHandler(async(req, res) =>{
     const {email, password} = req.body;
     if(!email || !password){
          throw new BadRequestError("Email and Password are required")
     }
     const deviceId = getDeviceFingerprint(req);
     const {accessToken, refreshToken, loggedInUser} = await authService.login(email, password, deviceId);
     res.cookie("accessToken", accessToken, {
        maxAge: config.ACCESS_TOKEN_EXP_SEC * 1000, // 15 minutes
        httpOnly: true,
        secure: true,
        sameSite: "strict"
     })
     res.cookie("refreshToken", refreshToken, {
        maxAge: config.REFRESH_TOKEN_EXP_SEC * 1000, // 7 days
        httpOnly: true,
        secure: true,
        sameSite: "strict"
     })
     .status(200).json({
          success: true,
          message: "Logged in successfully",
          loggedInUser
     })
})
exports.rotateRefreshToken = asyncHandler(async(req, res) =>{
     const refreshToken = req.cookies.refreshToken;
     if(!refreshToken){
          throw new UnauthorizedError("Refresh token is missing", "LOGIN AGAIN")
     }
     const deviceId = getDeviceFingerprint(req);
     const {newAccessToken, newRefreshToken} = await authService.rotateRefreshToken(refreshToken, deviceId);
     res.cookie("accessToken", newAccessToken, cookieOptions(config.ACCESS_TOKEN_EXP_SEC * 1000))
     res.cookie("refreshToken", newRefreshToken, cookieOptions(config.REFRESH_TOKEN_EXP_SEC * 1000))
     .status(200).json({
          success: true,
          message: "Access and Refresh token reissued"
     })
})


exports.verifyGoogleIdToken = asyncHandler(async(req, res) =>{
     const {idToken} = req.body;
     if(!idToken){
          throw new BadRequestError("Invalid Google ID Token", "INVALID TOKEN")
     }

     const deviceId = getDeviceFingerprint(req);
     
     const {accessToken, refreshToken, loggedInUser} = await authService.verifyGoogleIdToken(idToken, deviceId);
     
     res.cookie("accessToken", accessToken, cookieOptions(config.ACCESS_TOKEN_EXP_SEC * 1000))
     res.cookie("refreshToken", refreshToken, cookieOptions(config.REFRESH_TOKEN_EXP_SEC * 1000))
     .status(200).json({
          success: true,
          message: "Logged in successfully",
          loggedInUser
     })
})