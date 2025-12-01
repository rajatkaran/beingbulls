// website/components/Hero.jsx
import React from "react";

export default function Hero(){
  return (
    <section className="flex flex-col md:flex-row items-center gap-8">
      <div className="md:w-1/2">
        <h1 className="text-4xl font-extrabold">🐂 BeingBulls — Realtime Pattern Scanner</h1>
        <p className="text-[#9fb0c0] mt-3">Scan live charts, detect patterns, and overlay results directly on your screen. Works with TradingView & more.</p>
        <div className="mt-4 flex gap-3">
          <a className="btn btn-primary" href="/subscribe">Start — ₹59/week</a>
          <a className="btn btn-outline" href="/login">Login</a>
        </div>
      </div>

      <div className="md:w-1/2 relative glass p-4">
        <div className="relative h-56">
          <div className="bull-emoji">🐂</div>
          <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none" className="rounded">
            <polyline points="0,30 10,25 20,28 30,22 40,18 50,10 60,14 70,8 80,12 90,6 100,10"
              style={{ fill: 'none', stroke: '#4ade80', strokeWidth: 2, opacity: 0.95 }}></polyline>
          </svg>
        </div>
        <div className="text-sm text-[#9fb0c0] mt-3">Demo: bull runs and overlays appear when you scan using the extension.</div>
      </div>
    </section>
  );
}
