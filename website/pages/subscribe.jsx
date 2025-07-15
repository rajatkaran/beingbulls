// ✅ pages/subscribe.jsx
import React from "react";

const plans = [
  { label: "Weekly Plan", amount: 59, plan: "weekly" },
  { label: "Monthly Plan", amount: 219, plan: "monthly" },
];

const Subscribe = () => {
  const handleSubscribe = async (plan) => {
    const email = prompt("Enter your email:");
    if (!email) return;

    const res = await fetch(
      `/payment/create-order?email=${email}&plan=${plan}`
    );
    const order = await res.json();

    const razorpay = new window.Razorpay({
      key: "YOUR_RAZORPAY_KEY",
      amount: order.amount,
      currency: "INR",
      name: "BeingBulls",
      description: `${plan} subscription`,
      order_id: order.id,
      handler: function () {
        alert("Payment Success 🎉");
        window.location.href = "/dashboard";
      },
    });
    razorpay.open();
  };

  return (
    <div className="text-center py-32">
      <h2 className="text-3xl font-bold mb-8">💳 Choose Your Plan</h2>
      <div className="flex justify-center gap-10">
        {plans.map((p) => (
          <div
            key={p.plan}
            className="bg-white/40 backdrop-blur-md p-6 rounded-2xl shadow-xl w-64"
          >
            <h3 className="text-xl font-semibold mb-2">{p.label}</h3>
            <p className="text-lg">₹{p.amount}</p>
            <button
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700"
              onClick={() => handleSubscribe(p.plan)}
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscribe;

