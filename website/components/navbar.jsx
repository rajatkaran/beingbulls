import React, { useEffect, useState } from "react";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function Navbar() {
  const [subActive, setSubActive] = useState(false);
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${BACKEND}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("not-auth");
        return res.json();
      })
      .then(data => {
        setSubActive(Boolean(data?.isSubscribed));
        setEmail(data?.email || null);
      })
      .catch(() => {
        setSubActive(false);
        setEmail(null);
      });
  }, []);

  function logout() {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("loginExpiry");
    } catch (e) {}
    // also clear chrome storage if extension context sends message later
    try { chrome?.storage?.local?.remove(["bb_token","loginExpiry"]); } catch(e){}
    window.location.href = "/login";
  }

  return (
    <nav className="p-4 flex items-center justify-between bg-white shadow">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold">🐂 BeingBulls</div>
        <div className="text-sm text-gray-600">Realtime pattern scanner</div>
      </div>

      <div className="flex items-center gap-4">
        {email && <div className="text-sm text-gray-700">👤 {email}</div>}

        {!subActive ? (
          <button
            onClick={() => (window.location.href = "/subscribe")}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            💳 Subscribe
          </button>
        ) : (
          <div className="text-sm text-green-600 font-semibold">✅ Subscribed</div>
        )}

        {email ? (
          <button onClick={logout} className="px-3 py-1 border rounded">Logout</button>
        ) : (
          <button onClick={() => (window.location.href = "/login")} className="px-3 py-1 border rounded">
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
