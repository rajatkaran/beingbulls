import React, { useEffect, useState } from "react";
const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function Navbar() {
  const [email, setEmail] = useState(null);
  const [subActive, setSubActive] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("bb_token");
    if (!token) return;

    fetch(`${BACKEND}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.email) setEmail(data.email);
        if (data?.isSubscribed) setSubActive(true);
        if (data?.remaining_days) setDaysLeft(data.remaining_days);
      })
      .catch(() => {});
  }, []);

  function logout() {
    localStorage.removeItem("bb_token");
    window.location.href = "/login";
  }

  return (
    <nav className="w-full bg-black/90 text-white p-4 flex items-center justify-between shadow-lg">
      <div className="text-xl font-bold">🐂 BeingBulls</div>

      <div className="flex items-center gap-4">
        {email && (
          <span className="text-sm opacity-80">👤 {email}</span>
        )}

        {subActive ? (
          <span className="px-3 py-1 bg-green-600 rounded-full text-sm">
            ✅ Active • {daysLeft} days left
          </span>
        ) : (
          <a
            href="/subscribe"
            className="px-3 py-1 bg-yellow-500 text-black rounded-full text-sm"
          >
            🔓 Subscribe
          </a>
        )}

        <button
          onClick={logout}
          className="px-3 py-1 bg-red-600 rounded-lg text-sm"
        >
          🚪 Logout
        </button>
      </div>
    </nav>
  );
}
