// ✅ pages/subscribe.jsx
import React from "react";
import axios from "axios";

const Subscribe = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const token = localStorage.getItem("token");

  const plans = [
    { id: "weekly", name: "Weekly Plan", price: 59, period: "7 Days" },
    { id: "monthly", name: "Monthly Plan", price: 219, period: "28 Days" },
  ];

  const loadRazorpay = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const subscribe = async (plan) => {
    if (!token) {
      alert("⚠️ Please login first");
      window.location.href = "/login";
      return;
    }

    const res = await loadRazorpay("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      alert("❌ Failed to load Razorpay SDK");
      return;
    }

    try {
      // 🔹 Call backend to create an order
      const orderRes = await axios.post(
        `${BACKEND_URL}/create-order`,
        { planId: plan.id, amount: plan.price * 100 }, // in paisa
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { id: order_id, amount, currency } = orderRes.data;

      const options = {
        key: RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "BeingBulls",
        description: plan.name,
        order_id,
        handler: function (response) {
          alert("✅ Payment successful! Subscription activated.");
          window.location.href = "/dashboard";
        },
        prefill: {
          email: "user@example.com", // optional
        },
        theme: {
          color: "#6366f1",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      alert("❌ Payment failed");
    }
  };

  return (
    <div className="pt-24 px-6 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
        💳 Choose Your Plan
      </h1>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition"
          >
            <h2 className="text-2xl font-semibold mb-2">{plan.name}</h2>
            <p className="text-gray-600 mb-4">⏳ {plan.period}</p>
            <p className="text-3xl font-bold text-purple-600 mb-6">
              ₹{plan.price}
            </p>
            <button
              onClick={() => subscribe(plan)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl shadow-md hover:scale-105 transition"
            >
              🚀 Subscribe Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscribe;
