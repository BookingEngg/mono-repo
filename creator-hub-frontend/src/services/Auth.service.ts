// Client
import axiosClient from "@/services/http";
// Typings
import {
  IOAuthClientDetails,
  IUpdateOnboardingPayload,
  TUserType,
} from "@/typings/auth";

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
    url: "/user",
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

// Influencer onboarding — date of birth, gender, social media links. Every
// field is independently optional; omit what you don't want to change.
export const updateOnboardingDetails = async (
  payload: IUpdateOnboardingPayload
) => {
  const response = await axiosClient.put({
    url: "/user/onboarding",
    body: payload,
  });

  return response.data;
};

// Get the OAuths Client Id
export const getOAuthClientDetails = async (): Promise<IOAuthClientDetails> => {
  const response = await axiosClient.get({
    url: "/oauth/client-details",
  });

  return response.data;
};

// Login the User with Google OAuth Client Id. user_type only affects a
// brand-new account — the backend ignores it when the email already exists.
export const getUserByGoogleOAuth = async (payload: {
  token: string;
  user_type?: TUserType;
}) => {
  const response = await axiosClient.post({
    url: "/oauth/google-user",
    body: payload,
  });

  return response.data;
};
