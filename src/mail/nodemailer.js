import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config(); 

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.Nodemailerusername,
    pass: process.env.Nodemailerpassword,
  },
});

export const userotpsend = async (email, name, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"WHISKYHUB Reserve" <${process.env.Nodemailerusername || 'no-reply@whiskyhub.com'}>`,
      to: email,
      subject: `Your WhiskyHub Verification Code: ${otp}`,
      text: `Greetings ${name},\n\nYour WhiskyHub verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nBest regards,\nWhiskyHub Reserve Team`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>WhiskyHub Verification Code</title>
    <style>
        body { background-color: #050a15; margin: 0; padding: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
        .container { max-width: 540px; margin: 0 auto; background-color: #0a1128; border-radius: 16px; border: 1px solid rgba(212, 175, 55, 0.3); overflow: hidden; color: #ffffff; }
        .header { background: linear-gradient(135deg, #050a15, #111c44); padding: 30px 20px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .brand { font-size: 24px; font-weight: 900; letter-spacing: 4px; color: #f59e0b; margin: 0; }
        .subtitle { font-size: 10px; letter-spacing: 3px; color: #94a3b8; text-transform: uppercase; margin-top: 4px; }
        .content { padding: 35px 30px; text-align: center; }
        .greeting { font-size: 18px; color: #ffffff; margin-bottom: 15px; }
        .message { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 25px; }
        .otp-box { background: rgba(245, 158, 11, 0.08); border: 2px dashed rgba(245, 158, 11, 0.4); border-radius: 12px; padding: 20px; margin: 20px auto; max-width: 280px; }
        .otp-code { font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #fbbf24; font-family: monospace; }
        .expiry { font-size: 11px; color: #f59e0b; margin-top: 8px; }
        .footer { background-color: #050a15; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.05); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="brand">WHISKYHUB</h1>
            <p class="subtitle">Premium Spirits & VIP Reserve</p>
        </div>
        <div class="content">
            <p class="greeting">Welcome to the Club, <strong>${name}</strong></p>
            <p class="message">To complete your registration and activate your VIP member privileges, enter the following 4-digit code:</p>
            
            <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <div class="expiry">Valid for 10 minutes</div>
            </div>
            
            <p class="message" style="margin-top: 25px; font-size: 12px;">If you did not initiate this request, please disregard this email.</p>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} WhiskyHub Reserve. All Rights Reserved.
        </div>
    </div>
</body>
</html>
      `,
    });

    console.log("OTP email dispatched to:", email, "Message ID:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("Nodemailer notice (SMTP not available or errored):", err.message);
    return { success: false, error: err.message };
  }
};