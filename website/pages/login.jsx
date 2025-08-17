// ✅ pages/login.jsx
import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Backend URL from Vite env
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const sendOtp = async () => {
    if (!email) return alert("⚠️ Please enter email first");
    try {
      setLoading(true);
      await axios.post(`${BACKEND_URL}/send-otp`, { email });
      setStep(2);
      alert("📩 OTP sent to your email");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return alert("⚠️ Please enter OTP");
    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_URL}/verify-otp`, { email, otp });
      localStorage.setItem("token", res.data.access_token);
      alert("✅ Login success");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      alert("❌ OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
        🔐 Login to BeingBulls
      </h1>

      <div className="bg-white/40 backdrop-blur-xl shadow-lg rounded-2xl p-8 w-full max-w-md">
        <input
          type="email"
          placeholder="📧 Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-xl p-3 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={step === 2}
        />

        {step === 1 ? (
          <button
            onClick={sendOtp}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl shadow-md hover:scale-[1.02] transition disabled:opacity-50"
          >
            {loading ? "⏳ Sending..." : "🚀 Send OTP"}
          </button>
        ) : (
          <>
            <input
              type="text"
              placeholder="🔑 Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border border-gray-300 rounded-xl p-3 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-md hover:scale-[1.02] transition disabled:opacity-50"
            >
              {loading ? "⏳ Verifying..." : "✅ Verify & Login"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
