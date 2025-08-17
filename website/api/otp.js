const BASE = import.meta.env.VITE_BACKEND_URL;

export async function sendOtp(email){
  const res = await fetch(`${BASE}/api/auth/send-otp`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ email })
  });
  if(!res.ok) throw new Error((await res.json()).detail || "Failed to send OTP");
  return res.json();
}

export async function verifyOtp(email, otp){
  const res = await fetch(`${BASE}/api/auth/verify-otp`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ email, otp })
  });
  if(!res.ok) throw new Error((await res.json()).detail || "Invalid OTP");
  return res.json(); // {access_token}
}
