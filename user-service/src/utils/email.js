// src/utils/email.js

const sgMail = require("@sendgrid/mail");
const { config } = require("../config");

sgMail.setApiKey(config.SENDGRID_API_KEY);

function getOtpTemplate(otp) {
  return `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 420px;
      margin: auto;
      padding: 20px;
      border: 1px solid #e5e5e5;
      border-radius: 10px;
      background: #ffffff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    ">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #4A3AFF; margin: 0;">YourApp</h2>
      </div>

      <p>Hi,</p>

      <p>
        Welcome to <strong>YourApp</strong> 👋 <br/>
        Use the verification code below to complete your sign up:
      </p>

      <div style="text-align:center; margin:30px 0;">
        <div style="
          display:inline-block;
          padding:14px 26px;
          font-size:32px;
          letter-spacing:8px;
          font-weight:bold;
          background:#F4F4FF;
          border-radius:8px;
          color:#4A3AFF;
          border:1px solid #e0e0ff;
        ">
          ${otp}
        </div>
      </div>

      <p>
        This code will expire in <strong> 5 minutes</strong>.
      </p>

      <p>If this wasn't you, please ignore this email.</p>

      <hr style="border:none;border-top:1px solid #eee;margin:25px 0;" />

      <p style="font-size:14px;color:#888;text-align:center;">
        Thanks,<br/>
        <strong>Team YourApp</strong>
      </p>
    </div>
  `;
}

async function sendOtpEmail(email, otp) {
  try {
    const msg = {
      to: email,
      from: config.SENDGRID_FROM_EMAIL, // verified sender
      subject: "Verify your email address",
      html: getOtpTemplate(otp),
    };

    await sgMail.send(msg);

    return {
      success: true,
      message: "OTP email sent successfully",
    };
  } catch (error) {
    console.error("SendGrid Error:", error.response?.body || error);

    throw new Error("Failed to send OTP email");
  }
}

module.exports = {
  sendOtpEmail,
  getOtpTemplate,
};