import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "🏠 Home" },
    { path: "/subscribe", label: "💳 Subscribe" },
    { path: "/dashboard", label: "📊 Dashboard" },
  ];

  return (
    <nav className="backdrop-blur-md bg-white/30 fixed top-0 left-0 w-full z-50 shadow-sm border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600"
        >
          🐂 BeingBulls
        </Link>

        {/* Nav Links */}
        <div className="space-x-4 hidden md:block">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-xl text-sm font-medium hover:bg-white/40 transition-all duration-150 ${
                location.pathname === item.path ? "bg-white/50" : ""              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
