export type TGender = "male" | "female";

export interface ISocialMediaLinks {
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
}

// Onboarding lifecycle of the account itself, separate from roles. A brand
// created via /brand/signup starts "onboarding" (pending email
// verification) and flips to "active" once that step completes. Absent on
// every pre-existing account, which should be treated as active.
export type TAccountStatus = "onboarding" | "active";

export interface IUser {
  _id: string;
  first_name: string;
  last_name: string;
  email?: string;
  email_verified?: boolean;
  user_profile_picture?: string;
  roles: string[];
  privileges: string[];
  account_status?: TAccountStatus;

  // Influencer onboarding — absent until the creator fills the onboarding
  // form, so these are null rather than just missing.
  dob?: string | null;
  gender?: TGender | null;
  social_media_links?: ISocialMediaLinks | null;
}

// Brand's small signup form — no OAuth, no password.
export interface IBrandSignupPayload {
  brand_name: string;
  email: string;
  contact: string;
}

// Every field is independently optional — PUT /user/onboarding only touches
// what's sent, so a partially-filled form never clobbers other fields.
export interface IUpdateOnboardingPayload {
  dob?: string | null;
  gender?: TGender | null;
  social_media_links?: ISocialMediaLinks;
}

export interface IAuth {
  user: IUser | null;
  isAuthorized: boolean;
}

/**
 * Shape served by GET /oauth/client-details. Every field is optional because the
 * backend only returns the providers it has been configured with, and the UI
 * hides any provider it does not receive.
 */
export interface IOAuthClientDetails {
  google_client_id?: string;
  github_init_url?: string;
}

/**
 * Account type a creator picks at signup. Only respected by the backend when
 * it's actually creating a new account — an existing user's type never
 * changes just by logging in again.
 */
export type TUserType = "influencer" | "brand";
