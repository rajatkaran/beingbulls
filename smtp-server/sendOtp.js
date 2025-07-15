// ✅ smtp-server/sendotp.js

const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// POST /send-otp
app.post("/send-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email & OTP required." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_SENDER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"BeingBulls" <${process.env.SMTP_SENDER}>`,
      to: email,
      subject: "🧠 Your OTP for BeingBulls Login",
      text: `Your One-Time Password is: ${otp}`,
      html: `<div style="font-family:Arial;font-size:16px;">
              <p>Hi 👋,</p>
              <p>Your OTP is:</p>
              <h2 style="color:#007bff;">${otp}</h2>
              <p>This code will expire in 10 minutes.</p>
              <hr/>
              <p>🚀 BeingBulls Team</p>
            </div>`,
    });

    res.status(200).json({ message: "OTP sent successfully ✅" });
  } catch (error) {
    console.error("Email send failed:", error);
    res.status(500).json({ error: "Failed to send OTP ❌" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`📬 SMTP Server running on port ${PORT}`);
});
