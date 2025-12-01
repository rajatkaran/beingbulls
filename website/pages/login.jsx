import React, { useState } from "react";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function Login() {
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
    const data = await res.json();
    if (res.ok) {
      setOtpSent(true);
      alert("📩 OTP sent to your email!");
    } else {
      alert(data.detail || "❌ Error sending OTP");
    }
  };

  const verifyOtp = async () => {
    if (!otp) return alert("🔢 Please enter OTP!");
    const res = await fetch(`${BACKEND}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });

    const data = await res.json();
    if (!res.ok) return alert(data.detail || "❌ OTP incorrect");

    localStorage.setItem("token", data.access_token);
    alert("🎉 Login successful!");
    window.location.href = "/dashboard";
  };

  return (
    <div className="login-container">
      <h1>🔐 Login to BeingBulls</h1>

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
          <button onClick={verifyOtp}>✅ Verify OTP</button>
        </>
      )}

      <p
        onClick={() => window.location.href = "/forgot-password"}
        style={{ cursor: "pointer" }}
      >
        🔄 Forgot password?
      </p>

      <p
        onClick={() => window.location.href = "/signup"}
        style={{ cursor: "pointer" }}
      >
        ➕ Create new account
      </p>
    </div>
  );
}
