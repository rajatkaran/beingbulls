import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "../components/navbar.jsx";
import Home from "../pages/Home.jsx";
import Login from "../pages/login.jsx";
import Dashboard from "../pages/dashboard.jsx";
import Subscribe from "../pages/subscribe.jsx";

export default function App(){
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subscribe" element={<Subscribe />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
