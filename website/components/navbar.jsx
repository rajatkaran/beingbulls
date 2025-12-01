// website/components/navbar.jsx
import React, { useEffect, useState } from "react";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function Navbar(){
  const [email, setEmail] = useState(null);
  const [isSub, setIsSub] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(()=>{
    const token = localStorage.getItem("bb_token") || localStorage.getItem("token");
    if(!token) return;
    fetch(`${BACKEND}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if(d?.email) setEmail(d.email);
        if(d?.isSubscribed) { setIsSub(true); setDaysLeft(d.remaining_days || 0); }
      }).catch(()=>{});
  },[]);

  function logout(){
    try{ localStorage.removeItem("bb_token"); localStorage.removeItem("token"); }catch(e){}
    window.location.href = "/login";
  }

  return (
    <header className="glass px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7b61ff] to-[#00f2fe] flex items-center justify-center font-bold">🐂</div>
        <div>
          <div className="font-bold text-lg">BeingBulls</div>
          <div className="text-sm text-[#9fb0c0]">Realtime pattern scanner</div>
        </div>
      </div>

      <nav className="flex items-center gap-4">
        <a href="/" className="text-sm">Home</a>
        <a href="/#features" className="text-sm desktop-only">Features</a>
        <a href="/subscribe" className="text-sm">Pricing</a>
        {!email ? (
          <a href="/login" className="text-sm btn btn-outline">Login</a>
        ) : (
          <>
            <div className="text-sm text-[#cdeffd]">👤 {email}</div>
            {isSub ? <div className="text-xs px-2 py-1 bg-[#061022] rounded text-[#8ef3ff]">✅ {daysLeft}d left</div> : <a href="/subscribe" className="text-sm btn btn-outline">Subscribe</a>}
            <button onClick={logout} className="text-sm btn btn-outline">Logout</button>
          </>
        )}
      </nav>
    </header>
  );
}
