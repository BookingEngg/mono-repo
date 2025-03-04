// Client
import axiosClient from "@/services/http";

// Service to send otp via email
export const sendOtp = async (payload: { email: string }) => {
  const response = await axiosClient.post({
    url: "/otp/create",
    body: payload,
  });

  return response.data;
};

// Verify the otp send on perticular email
export const verifyOtp = async (payload: { email: string; otp: string }) => {
  const response = await axiosClient.post({
    url: "/otp/verify",
    body: payload,
  });

  return response.data;
};

// Service which verify the cookie and serve user
export const getUser = async () => {
  const response = await axiosClient.get({
    url: `/user`,
  });

  return response.data;
};

// Make the authorized user logout
export const logoutAuthUser = async () => {
  const response = await axiosClient.post({
    url: "/user/logout",
  });

  return response.data;
};
