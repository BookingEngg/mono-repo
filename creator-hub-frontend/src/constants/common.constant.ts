// Length of the OTP delivered over email, drives the OtpInput slot count
export const OTP_LENGTH = 6;

// Seconds a creator has to wait before a fresh OTP can be requested
export const OTP_RESEND_INTERVAL = 30;

export const ROUTE_PATHS = {
  // Login is shared by both influencers and brands — an existing account of
  // either role can return here (OAuth for influencers, email+OTP for
  // either). It only ever logs in; a login attempt for an email with no
  // account errors and points to SIGNUP instead of silently creating one.
  LOGIN: "/login",
  // Influencer's own signup — same OAuth providers as LOGIN, but flagged as
  // a signup so a brand-new account is actually allowed to be created.
  SIGNUP: "/signup",
  // Brand's own signup form — never linked from LOGIN/SIGNUP, which are
  // reserved for influencers.
  BRAND_SIGNUP: "/brand/signup",
  // Brand's own return login — email+OTP only, no OAuth (brands never had
  // an OAuth identity). Its own URL rather than sharing LOGIN's OAuth UI.
  BRAND_LOGIN: "/brand/login",
  // Where an onboarding-status brand lands right after signup, until they
  // verify their email.
  BRAND_ONBOARDING: "/brand/onboarding",
  OAUTH_CALLBACK: "/oauth/callback",
  HOME: "/",
  EXPLORE: "/explore",
  PROFILE: "/profile",
  CREATE_JOB: "/job/new",
  MY_APPLICATIONS: "/applications",
  // Brand-only: what they've paid creators and what's still owed.
  SETTLEMENT: "/settlement",
  // Route pattern for React Router registration — use getJobCheckoutPath()
  // to build an actual link with a real short_id.
  JOB_CHECKOUT: "/jobs/:shortId/checkout",
  // Pattern for React Router — use getPaymentCheckoutPath() to build a link.
  PAYMENT_CHECKOUT: "/payment/:paymentType/checkout",
};

export const getJobCheckoutPath = (shortId: string): string =>
  `/jobs/${shortId}/checkout`;

export const getPaymentCheckoutPath = (paymentType: string): string =>
  `/payment/${paymentType}/checkout`;

/**
 * Checkout link for settling one slice of pending earnings. Carries only
 * WHICH slice — the server sums it and prices the payment itself.
 */
export const getSettlementCheckoutPath = (
  scope: "creator",
  reference: string,
): string =>
  `/payment/online/checkout?scope=${scope}&ref=${encodeURIComponent(reference)}`;
