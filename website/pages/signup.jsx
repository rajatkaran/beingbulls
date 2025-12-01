import React, { useState } from "react";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function Signup() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const sendOtp = async () => {
    if (!email) return alert("⚠️ Please enter your email!");
    const res = await fetch(`${BACKEND}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    if (res.ok) {
      setOtpSent(true);
      alert("📨 OTP sent! Check your inbox.");
    } else {
      alert("❌ Could not send OTP.");
    }
  };

  const verifyOtp = async () => {
    if (!otp) return alert("🔢 Enter the OTP!");
    const res = await fetch(`${BACKEND}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });

    const data = await res.json();
    if (!res.ok) return alert(data.detail || "❌ Incorrect OTP!");

    localStorage.setItem("token", data.access_token);
    alert("🎉 Account created successfully!");
    window.location.href = "/dashboard";
  };

  return (
    <div className="signup">
      <h1>✨ Create Your BeingBulls Account</h1>

      <input
        type="email"
        placeholder="📧 Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {!otpSent ? (
        <button onClick={sendOtp}>📨 Send OTP</button>
      ) : (
        <>
          <input
            type="text"
            placeholder="🔢 Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button onClick={verifyOtp}>🚀 Verify & Continue</button>
        </>
      )}

      <p
        onClick={() => window.location.href = "/login"}
        style={{ cursor: "pointer" }}
      >
        🔐 Already have an account? Login
      </p>
    </div>
  );
}
