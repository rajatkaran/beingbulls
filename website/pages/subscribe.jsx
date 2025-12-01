// website/pages/subscribe.jsx
import React, { useEffect, useState } from "react";

const BACKEND = import.meta.env.VITE_BACKEND_URL;
const RZP_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("bb_token");

  if (!token) {
    alert("🔒 Please login first!");
    window.location.href = "/login";
  }

  async function createOrder(amount) {
    const res = await fetch(`${BACKEND}/payment/create-order`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });

    if (!res.ok) {
      console.error(await res.text());
      throw new Error("Order create failed");
    }

    return res.json();
  }

  async function startPayment(plan) {
    const amount = plan === "weekly" ? 5900 : 21900; // paise
    setLoading(true);
    try {
      const orderData = await createOrder(amount);

      const options = {
        key: RZP_KEY,
        amount: orderData.amount,
        currency: "INR",
        name: "BeingBulls",
        description: `${plan.toUpperCase()} Subscription`,
        order_id: orderData.order_id,
        theme: {
          color: "#00f2fe",
        },
        handler: async function (response) {
          const verifyBody = {
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            plan: plan,
          };

          const res = await fetch(`${BACKEND}/payment/verify`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
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
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">💳 Choose Your Plan</h2>

      <div className="grid gap-6">
        {/* WEEKLY */}
        <div className="p-4 border rounded-xl shadow bg-white">
          <h3 className="text-xl font-bold mb-2">⚡ Weekly Plan</h3>
          <p className="text-gray-600 mb-4">₹59 / 7 days</p>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            disabled={loading}
            onClick={() => startPayment("weekly")}
          >
            {loading ? "⏳ Please wait..." : "🟦 Buy Weekly"}
          </button>
        </div>

        {/* MONTHLY */}
        <div className="p-4 border rounded-xl shadow bg-white">
          <h3 className="text-xl font-bold mb-2">🔥 Monthly Plan</h3>
          <p className="text-gray-600 mb-4">₹219 / 28 days</p>
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
            disabled={loading}
            onClick={() => startPayment("monthly")}
          >
            {loading ? "⏳ Please wait..." : "🟩 Buy Monthly"}
          </button>
        </div>
      </div>
    </div>
  );
}
