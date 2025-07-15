import React from "react";
import { Link } from "react-router-dom";
import bullRun from "../src/bull-run.json"; // lottie animation
import Lottie from "lottie-react";

const Home = () => {
  return (
    <div className="bg-gradient-to-br from-white via-blue-100 to-purple-200 min-h-screen text-gray-800 font-sans">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-6 pt-24">
        <div className="w-72 md:w-96">
          <Lottie animationData={bullRun} loop={true} />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mt-4">
          Scan Smart. Trade Bold. 💹
        </h1>
        <p className="text-lg md:text-xl mt-4 max-w-2xl">
          ✨ Get real-time candlestick pattern detection directly inside your trading charts with our smart Chrome Extension. No BS, just signals.
        </p>
        <Link to="/login">
          <button className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-xl hover:scale-105 transition font-semibold">
            🚀 Get Started Free
          </button>
        </Link>
      </div>

      {/* Features Section */}
      <div className="py-20 px-8 md:px-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-10">
          Why BeingBulls? 🧠💸
        </h2>
        <div className="grid md:grid-cols-3 gap-10 text-left">
          {[
            {
              title: "📊 53+ Pattern Detections",
              desc: "Candle + chart patterns + EMA confirmed, confidence scored."
            },
            {
              title: "🔒 OTP-Based Login",
              desc: "Simple, secure login via email OTP. No passwords, no stress."
            },
            {
              title: "🧠 Clean UI, Glassmorphism",
              desc: "Youthful design, neon-glow, and emojis that don’t suck."
            },
            {
              title: "🪙 Just ₹59/week",
              desc: "Or ₹219/month. No fake promises. Cancel anytime."
            },
            {
              title: "📈 Extension + Website Sync",
              desc: "Track history, scan patterns, toggle feedback across devices."
            },
            {
              title: "💬 Feedback Logging",
              desc: "Toggle whether our predictions were accurate — we listen."
            }
          ].map((feat, idx) => (
            <div
              key={idx}
              className="bg-white/30 backdrop-blur-lg rounded-2xl p-6 shadow-md hover:shadow-xl transition"
            >
              <h3 className="text-xl font-semibold mb-2">{feat.title}</h3>
              <p>{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-10 text-sm text-gray-600">
        © {new Date().getFullYear()} BeingBulls. All rights reserved 🐂
      </footer>
    </div>
  );
};

export default Home;
