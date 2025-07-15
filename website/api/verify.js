import axios from "axios";

export const verifyOtp = async (email, otp) => {
  try {
    const res = await axios.post("/api/verify", { email, otp });
    return res.data;
  } catch (err) {
    throw new Error("OTP verification failed");
  }
};
