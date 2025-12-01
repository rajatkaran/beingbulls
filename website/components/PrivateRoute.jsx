import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAllowed(false);
      setLoading(false);
      return;
    }

    // Live backend check
    fetch(`${BACKEND}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data?.isSubscribed) {
          setAllowed(true);
        } else {
          setAllowed(false);
        }
      })
      .catch(() => setAllowed(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center p-10">⏳ Checking subscription…</div>;

  return allowed ? children : <Navigate to="/subscribe" />;
}
