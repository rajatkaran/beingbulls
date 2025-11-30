// website/pages/login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "https://beingbulls-backend.onrender.com";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function sendOtp() {
    if (!email) return alert("Enter email");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error("Send failed");
      setOtpSent(true);
      alert("OTP sent. Check email.");
    } catch (e) {
      console.error(e);
      alert("Could not send OTP");
    } finally { setLoading(false); }
  }

  async function verifyOtp() {
    if (!email || !otp) return alert("Enter OTP");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      if (!res.ok) {
        const t = await res.text().catch(()=>"");
        throw new Error(t || "Verify failed");
      }
      const j = await res.json();
      const token = j.access_token;
      localStorage.setItem("bb_token", token);
      // optional: store email
      localStorage.setItem("bb_email", email);
      alert("Logged in");
      nav("/dashboard");
    } catch (e) {
      console.error(e);
      alert("OTP verify failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Login / Signup</h2>
      <label className="block mb-2">Email</label>
      <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 border rounded mb-3" placeholder="you@example.com"/>
      {!otpSent ? (
        <button onClick={sendOtp} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
          {loading ? "Sending..." : "Send OTP"}
        </button>
      ) : (
        <>
          <label className="block mt-4 mb-2">Enter OTP</label>
          <input value={otp} onChange={e=>setOtp(e.target.value)} className="w-full p-2 border rounded mb-3" placeholder="123456" />
          <div className="flex gap-2">
            <button onClick={verifyOtp} className="px-4 py-2 bg-green-600 text-white rounded" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <button onClick={()=>setOtpSent(false)} className="px-4 py-2 border rounded">Edit Email</button>
          </div>
        </>
      )}
      <div className="mt-4 text-sm">
        New here? <a className="text-blue-600" href="/signup">Create account</a>
      </div>
    </div>
  );
}
