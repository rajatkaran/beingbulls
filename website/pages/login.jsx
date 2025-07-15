// ✅ pages/login.jsx
import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);

  const sendOtp = async () => {
    try {
      await axios.post("/api/otp", { email });
      setStep(2);
    } catch (err) {
      alert("Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post("/api/verify", { email, otp });
      localStorage.setItem("token", res.data.access_token);
      alert("Login success ✅");
      window.location.href = "/dashboard";
    } catch (err) {
      alert("OTP verification failed ❌");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
      <h1 className="text-3xl font-bold mb-6">🔐 Login to BeingBulls</h1>

      <input
        type="email"
        placeholder="📧 Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded-xl p-3 w-72 mb-4"
        disabled={step === 2}
      />

      {step === 1 ? (
        <button
          onClick={sendOtp}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
        >
          🚀 Send OTP
        </button>
      ) : (
        <>
          <input
            type="text"
            placeholder="🔑 Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border rounded-xl p-3 w-72 mb-4"
          />
          <button
            onClick={verifyOtp}
            className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700"
          >
            ✅ Verify & Login
          </button>
        </>
      )}
    </div>
  );
};

export default Login;