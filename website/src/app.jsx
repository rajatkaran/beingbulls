// website/src/app.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "../index.css"; // global tailwind + styles

import Navbar from "../components/navbar.jsx"; // your navbar file
import Home from "../pages/Home.jsx";
import Login from "../pages/login.jsx";
import Signup from "../pages/signup.jsx";
import Subscribe from "../pages/subscribe.jsx";
import Dashboard from "../pages/dashboard.jsx";
import ForgotPassword from "../pages/forgot-password.jsx";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            {/* fallback */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

const container = document.getElementById("root");
createRoot(container).render(<App />);
export default App;
