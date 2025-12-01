// website/components/PrivateRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "https://beingbulls-backend.onrender.com";

export default function PrivateRoute({ children, requireSubscription = false }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("bb_token");
      if (!token) {
        setAllowed(false);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${BACKEND}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Auth failed");
        const j = await res.json();
        if (requireSubscription) {
          setAllowed(Boolean(j.isSubscribed));
        } else {
          setAllowed(true);
        }
      } catch (e) {
        console.error("PrivateRoute auth error", e);
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [requireSubscription]);

  if (loading) return <div className="p-6">⏳ Checking authentication...</div>;
  if (!allowed) return <Navigate to="/login" replace />;
  return children;
}
