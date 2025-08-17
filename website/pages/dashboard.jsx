// ✅ pages/dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      alert("⚠️ Please login first");
      window.location.href = "/login";
    } else {
      fetchHistory();
    }
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data || []);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const runScan = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${BACKEND_URL}/scan`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✅ Scan complete: ${res.data.patterns?.length || 0} patterns found`);
      fetchHistory(); // refresh after scan
    } catch (err) {
      console.error(err);
      alert("❌ Scan failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 px-6 bg-gradient-to-br from-purple-50 via-blue-50 to-white min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
        📊 BeingBulls Dashboard
      </h1>

      <div className="flex justify-center mb-10">
        <button
          onClick={runScan}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl shadow-md hover:scale-105 transition disabled:opacity-50"
        >
          {loading ? "⏳ Running..." : "🚀 Run New Scan"}
        </button>
      </div>

      <div className="max-w-5xl mx-auto bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">📜 Scan History</h2>
        {loading && <p className="text-gray-600">Loading...</p>}
        {history.length === 0 ? (
          <p className="text-gray-500">No history yet. Run your first scan 🚀</p>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-300 text-gray-700">
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Pattern</th>
                <th className="py-2 px-4">Symbol</th>
                <th className="py-2 px-4">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-200 hover:bg-white/60 transition"
                >
                  <td className="py-2 px-4">
                    {new Date(row.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2 px-4">{row.pattern || "—"}</td>
                  <td className="py-2 px-4">{row.symbol || "N/A"}</td>
                  <td className="py-2 px-4">
                    {row.confidence ? `${row.confidence}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
