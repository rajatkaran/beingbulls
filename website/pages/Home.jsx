// website/pages/Home.jsx
import React from "react";
import Hero from "../components/Hero.jsx";
import HistoryTable from "../components/HistoryTable.jsx";

export default function Home(){
  return (
    <div className="container mx-auto px-6 py-8">
      <Hero />
      <section className="mt-8">
        <h3 className="text-xl font-semibold mb-4">⭐ Quick Features</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass p-4">
            <h4 className="font-bold">Live OHLC Scraping</h4>
            <p className="text-sm text-[#9fb0c0] mt-2">Extract candles directly from TradingView & other charts — no uploads.</p>
          </div>
          <div className="glass p-4">
            <h4 className="font-bold">53+ Patterns</h4>
            <p className="text-sm text-[#9fb0c0] mt-2">Comprehensive pattern engine with confidence scores and EMA confirmation.</p>
          </div>
          <div className="glass p-4">
            <h4 className="font-bold">Overlay Visuals</h4>
            <p className="text-sm text-[#9fb0c0] mt-2">Glassmorphism overlays, labels, and click-to-pin interactions.</p>
          </div>
        </div>
      </section>

      <section id="features" className="mt-10">
        <h3 className="text-xl font-semibold mb-4">📊 Recent Scans</h3>
        <HistoryTable limit={5} />
      </section>
    </div>
  );
}
