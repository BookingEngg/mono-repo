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
  CREATE_JOB: "/job/new",
  MY_APPLICATIONS: "/applications",
  // Route pattern for React Router registration — use getJobCheckoutPath()
  // to build an actual link with a real short_id.
  JOB_CHECKOUT: "/jobs/:shortId/checkout",
};

export const getJobCheckoutPath = (shortId: string): string =>
  `/jobs/${shortId}/checkout`;
