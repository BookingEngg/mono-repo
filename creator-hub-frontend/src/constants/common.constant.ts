// Length of the OTP delivered over email, drives the OtpInput slot count
export const OTP_LENGTH = 6;

// Seconds a creator has to wait before a fresh OTP can be requested
export const OTP_RESEND_INTERVAL = 30;

export const ROUTE_PATHS = {
  LOGIN: "/login",
  SIGNUP: "/signup",
  OAUTH_CALLBACK: "/oauth/callback",
  HOME: "/",
  EXPLORE: "/explore",
  PROFILE: "/profile",
};
