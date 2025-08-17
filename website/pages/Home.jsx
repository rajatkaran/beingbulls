import React from "react";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import bullRun from "../bull-run.json"; // ✅ fixed path

const Home = () => {
  return (
    <div className="bg-gradient-to-br from-white via-blue-100 to-purple-200 min-h-screen text-gray-800 font-sans">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-6 pt-28">
        <div className="w-72 md:w-96 drop-shadow-lg">
          <Lottie animationData={bullRun} loop={true} />
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mt-6">
          Scan Smart. Trade Bold. 💹
        </h1>
        <p className="text-lg md:text-xl mt-4 max-w-2xl text-gray-700">
          ✨ Get real-time candlestick pattern detection directly inside your
          trading charts with our smart Chrome Extension. No BS, just signals.
        </p>
        <Link to="/login">
          <button className="mt-8 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200 font-semibold">
            🚀 Get Started Free
          </button>
        </Link>
      </div>

      {/* Features Section */}
      <div className="py-20 px-8 md:px-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
          Why BeingBulls? 🧠💸
        </h2>
        <div className="grid md:grid-cols-3 gap-10 text-left">
          {[
            {
              title: "📊 53+ Pattern Detections",
              desc: "Candlestick + chart patterns with EMA confirmation and confidence scoring."
            },
            {
              title: "🔒 OTP-Based Login",
              desc: "Simple, secure login via email OTP. No passwords, no stress."
            },
            {
              title: "🧠 Clean UI, Glassmorphism",
              desc: "Youthful design, neon glow, and emojis that don’t suck."
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
              desc: "Toggle whether predictions were accurate — we listen."
            }
          ].map((feat, idx) => (
            <div
              key={idx}
              className="bg-white/30 backdrop-blur-lg rounded-2xl p-6 shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <h3 className="text-xl font-semibold mb-2">{feat.title}</h3>
              <p className="text-gray-700">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-10 text-sm text-gray-600">
        © {new Date().getFullYear()} <span className="font-semibold">BeingBulls</span>. All rights reserved 🐂
      </footer>
    </div>
  );
};

export default Home;
