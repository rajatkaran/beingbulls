// website/src/app.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "../index.css";

import Navbar from "../components/navbar.jsx";
import Home from "../pages/Home.jsx";
import Login from "../pages/login.jsx";
import Signup from "../pages/signup.jsx";
import Subscribe from "../pages/subscribe.jsx";
import Dashboard from "../pages/dashboard.jsx";
import ForgotPassword from "../pages/forgot-password.jsx";
import PrivateRoute from "../components/PrivateRoute.jsx";

function App(){
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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<App />);
export default App;
