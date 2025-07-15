export const openRazorpay = (order, plan) => {
  const razorpay = new window.Razorpay({
    key: "YOUR_RAZORPAY_KEY", // 🔁 Replace this on deploy
    amount: order.amount,
    currency: "INR",
    name: "BeingBulls",
    description: `${plan} subscription`,
    order_id: order.id,
    handler: function () {
      alert("🎉 Payment Success");
      window.location.href = "/dashboard";
    },
  });
  razorpay.open();
};
