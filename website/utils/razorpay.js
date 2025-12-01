export async function startPayment(plan) {
  const BACKEND = import.meta.env.VITE_BACKEND_URL;
  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

  const token = localStorage.getItem("token");
  if (!token) return alert("Please login first.");

  // Create Razorpay order from backend
  const orderRes = await fetch(`${BACKEND}/payment/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ plan })
  });

  const orderData = await orderRes.json();
  if (!orderRes.ok) {
    alert(orderData.detail || "Order creation failed");
    return;
  }

  // Build Razorpay checkout
  const options = {
    key: RAZORPAY_KEY,
    amount: orderData.amount,
    currency: "INR",
    name: "BeingBulls",
    description: "Subscription Payment",
    order_id: orderData.order_id,

    handler: async function (response) {
      // Send verification to backend
      const verifyRes = await fetch(`${BACKEND}/payment/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          order_id: response.razorpay_order_id,
          payment_id: response.razorpay_payment_id,
          signature: response.razorpay_signature,
          plan
        })
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        alert("❌ Payment verification failed");
        return;
      }

      alert("🎉 Subscription Activated Successfully!");
      window.location.href = "/dashboard";
    },

    theme: { color: "#0b74ff" }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
