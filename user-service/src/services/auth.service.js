const { ConflictError } = require("../utils/error");
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
module.exports = {
    sendOtp
}