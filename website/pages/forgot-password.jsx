// website/pages/forgot-password.jsx
import React, { useState } from "react";
const BACKEND = import.meta.env.VITE_BACKEND_URL || "https://beingbulls-backend.onrender.com";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: send otp, 2: verify & reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    if (!email) return alert("⚠️ Email daal bhai");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/auth/send-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error("Send failed");
      alert("✉️ Reset OTP sent to your email");
      setStep(2);
    } catch (e) {
      console.error(e);
      alert("🚫 Could not send OTP");
    } finally { setLoading(false); }
  }

  async function resetPassword() {
    if (!email || !otp || !pwd) return alert("⚠️ Fill all fields");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: pwd })
      });
      if (!res.ok) {
        const t = await res.text().catch(()=>"");
        throw new Error(t || "Reset failed");
      }
      alert("✅ Password reset successful — now login using OTP or password (if implemented)");
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
      alert("🚫 Reset failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">🔐 Forgot Password</h2>

      {step === 1 && (
        <>
          <label className="block mb-2">✉️ Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 border rounded mb-3" placeholder="you@example.com" />
          <button onClick={sendOtp} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
            {loading ? "⏳ Sending..." : "📩 Send Reset OTP"}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <label className="block mb-2">🔑 OTP</label>
          <input value={otp} onChange={e=>setOtp(e.target.value)} className="w-full p-2 border rounded mb-3" placeholder="123456" />
          <label className="block mb-2">🔒 New Password</label>
          <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} className="w-full p-2 border rounded mb-3" placeholder="New strong password" />
          <div className="flex gap-2">
            <button onClick={resetPassword} className="px-4 py-2 bg-green-600 text-white rounded" disabled={loading}>
              {loading ? "⏳ Resetting..." : "✅ Reset Password"}
            </button>
            <button onClick={()=>setStep(1)} className="px-4 py-2 border rounded">↩️ Back</button>
          </div>
        </>
      )}
    </div>
  );
}
