const { TooManyRequestsError } = require("./error");
const {config} = require('../config');
const {redis} = require('../config/redis');
const otpGenerator = require('otp-generator');
const crypto = require('crypto');


const RATE_MAX = parseInt(config.OTP_RATE_MAX_PER_HOUR || '5', 10);
const ATTEMPT_MAX = parseInt(config.OTP_MAX_VERIFY_ATTEMPTS || '5', 10);
const OTP_TTL = parseInt(config.OTP_TTL || '300', 10);
const HMAC_SECRET = config.OTP_HMAC_SECRET

function hmacFor(email, otp){
    return crypto.createHmac('sha256', HMAC_SECRET).update(email + ":" + otp).digest('hex');

}

async function generateAndStoreOtp(meta) {
    const ratekey = `otp:rate:${meta.email}`;
    const setCount = parseInt(await redis.get(ratekey) || "0", 10);
    if (setCount >= RATE_MAX) {
          throw new TooManyRequestsError(
               "Too many OTP requests. Try again later.",
               "OTP_RATE_LIMIT"
          );
    }
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    const otpSessionId=crypto.randomUUID();
    const hashed = hmacFor(meta.email, otp);
    await redis.set(`otp:session:${otpSessionId}`, JSON.stringify({
        hashedOtp:hashed,
        meta
    }) , 'EX', OTP_TTL);
    await redis.incr(ratekey);
    await redis.expire(ratekey, 3600);
    return {otp , otpSessionId};

    
}