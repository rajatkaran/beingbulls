// website/pages/subscribe.jsx
import React, { useEffect, useState } from "react";

const BACKEND = import.meta.env.VITE_BACKEND_URL;
const RZP_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("bb_token") || localStorage.getItem("token");

  useEffect(() => {
    if (!token) return (window.location.href = "/login");
    // quick check
    fetch(`${BACKEND}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d?.isSubscribed) {
          alert("🎉 You already have an active subscription!");
          window.location.href = "/dashboard";
        }
      })
      .catch(() => {});
  }, []);

  async function createOrder(amount, plan) {
    const res = await fetch(`${BACKEND}/payment/create-order`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, plan }),
    });
    if (!res.ok) throw new Error("Order create failed");
    return res.json();
  }

  async function startPayment(plan) {
    if (!token) { alert("🔒 Please login first"); return; }
    const amount = plan === "monthly" ? 21900 : 5900; // paise
    setLoading(true);
    try {
      const orderData = await createOrder(amount, plan);
      const options = {
        key: RZP_KEY,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "BeingBulls",
        description: `${plan.toUpperCase()} Subscription`,
        order_id: orderData.order_id,
        theme: { color: "#00f2fe" },
        handler: async function (response) {
          // verify on backend
          const verifyBody = {
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            plan,
          };
          const res = await fetch(`${BACKEND}/payment/verify`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(verifyBody),
          });
          if (!res.ok) {
            alert("❌ Payment verification failed");
            console.error(await res.text());
            return;
          }
          alert("🎉 Subscription Activated!");
          window.location.href = "/dashboard";
        },
        modal: { ondismiss: function(){ setLoading(false); } }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error(e);
      alert("⚠️ Something went wrong while starting payment");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">💳 Choose Your Plan</h2>
      <div className="grid gap-6">
        <div className="p-4 border rounded-xl shadow bg-white">
          <h3 className="text-xl font-bold mb-2">⚡ Weekly Plan</h3>
          <p className="text-gray-600 mb-4">₹59 / 7 days</p>
          <button className="w-full bg-cyan-500 text-white py-2 rounded-lg" disabled={loading} onClick={() => startPayment("weekly")}>
            {loading ? "⏳ Please wait..." : "🟦 Buy Weekly"}
          </button>
        </div>

        <div className="p-4 border rounded-xl shadow bg-white">
          <h3 className="text-xl font-bold mb-2">🔥 Monthly Plan</h3>
          <p className="text-gray-600 mb-4">₹219 / 28 days</p>
          <button className="w-full bg-green-600 text-white py-2 rounded-lg" disabled={loading} onClick={() => startPayment("monthly")}>
            {loading ? "⏳ Please wait..." : "🟩 Buy Monthly"}
          </button>
        </div>
      </div>
    </div>
  );
}
