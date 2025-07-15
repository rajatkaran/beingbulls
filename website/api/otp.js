import axios from "axios";

export const sendOtp = async (email) => {
  try {
    const res = await axios.post("/api/otp", { email });
    return res.data;
  } catch (err) {
    throw new Error("OTP send failed");
  }
};
