// website/pages/dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function Dashboard() {
  const [user, setUser] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const token = localStorage.getItem("bb_token");
  const email = localStorage.getItem("bb_email");

  // If not logged in
  if (!token) {
    window.location.href = "/login";
  }

  // ---- Fetch user profile ----
  async function loadUser() {
    try {
      const res = await fetch(`${BACKEND}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("User fetch failed");

      const data = await res.json();
      setUser(data);
    } catch (e) {
      console.error(e);
      alert("⚠️ Cannot load user profile");
    }
  }

  // ---- Fetch scan history ----
  async function loadHistory() {
    try {
      const res = await fetch(`${BACKEND}/scan/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setHistory(data.history || []);
    } catch (e) {
      console.error(e);
      alert("⚠️ Unable to load scan history");
    }
  }

  useEffect(() => {
    Promise.all([loadUser(), loadHistory()]).finally(() =>
      setLoading(false)
    );
  }, []);

  function remainingDays() {
    if (!user.subscription_expiry) return 0;
    const diff = new Date(user.subscription_expiry) - new Date();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  const subscribed = user.isSubscribed && remainingDays() > 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">👋 Welcome, {email}</h1>

      {/* ---- Subscription Section ---- */}
      <div className="mb-6 p-4 border rounded-xl shadow bg-white">
        <h2 className="text-xl font-bold mb-2">📅 Subscription Status</h2>

        {subscribed ? (
          <>
            <p className="text-green-700 font-semibold">
              ✅ Active Subscription
            </p>
            <p className="text-gray-600">
              ⏳ Days remaining: <b>{remainingDays()}</b>
            </p>
          </>
        ) : (
          <>
            <p className="text-red-600 font-semibold">❌ Not Subscribed</p>
            <button
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg"
              onClick={() => nav("/subscribe")}
            >
              💳 Subscribe Now
            </button>
          </>
        )}
      </div>

      {/* ---- Extension Section ---- */}
      <div className="mb-6 p-4 border rounded-xl bg-white shadow">
        <h2 className="text-xl font-bold mb-2">🧩 Chrome Extension</h2>
        <p className="mb-3 text-gray-700">
          Use the extension to scan live charts & detect patterns.
        </p>
        <a
          href="https://chromewebstore.google.com" // CHANGE THIS when you publish!!
          target="_blank"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          🚀 Open Extension
        </a>
      </div>

      {/* ---- Scan History Table ---- */}
      <div className="p-4 border rounded-xl bg-white shadow">
        <h2 className="text-xl font-bold mb-4">📊 Scan History</h2>

        {history.length === 0 ? (
          <p className="text-gray-500">😕 No scans yet.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">📅 Time</th>
                <th className="p-2">📈 Pattern</th>
                <th className="p-2">📊 Confidence</th>
                <th className="p-2">📉 EMA</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2">
                    {new Date(row.timestamp).toLocaleString()}
                  </td>
                  <td className="p-2">{row.patterns_detected?.join(", ")}</td>
                  <td className="p-2">
                    {row.confidence_scores?.join(", ") || "-"}
                  </td>
                  <td className="p-2">
                    {row.ema_confirmed ? "✅" : "❌"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
