const { ConflictError, BadRequestError } = require("../utils/error");
const bcrypt = require('bcrypt');
const prisma = require("../config/prisma");
const { sendOtpEmail } = require("../utils/email");
const { generateAndStoreOtp } = require("../utils/otp");

const sendOtp = async (firstname, lastname, email, password) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            email
        }
    })
    if (existingUser) {
        throw new ConflictError("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const meta = {firstname, lastname, email, hashedPassword};
    const {otp, otpSessionId} = await generateAndStoreOtp(meta);
    await sendOtpEmail(email, otp);
    return {otpSessionId};
    
}

const verifyOTP = async (otp, otpSessionId) => {
    // TODO: Verify OTP and create user
    const meta = await verifyOtp(otp, otpSessionId);
    if(meta == null){
        throw new BadRequestError("Invalid or Expire OTP")
    }
    const user =await prisma.user.create({
        data:{
            firstname:meta.firstname,
            lastname:meta.lastname,
            email:meta.email,
            password:meta.hashedPassword,
            emailVerified:true
        }
    })
}
module.exports = {
    sendOtp,
    verifyOTP
}