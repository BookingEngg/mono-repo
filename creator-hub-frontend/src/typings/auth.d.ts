export type TGender = "male" | "female";

export interface ISocialMediaLinks {
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
}

// Onboarding lifecycle of the account itself, separate from roles.
//
// "onboarding" means different things by role. A brand created via
// /brand/signup starts there pending email verification, moves to
// "pending_deposit" once verified, and reaches "active" only when the
// security deposit settles — which is what unlocks posting jobs. A creator
// starts there with an unfinished profile and reaches "active" once their
// profile, bank and KYC sections are all filled in.
//
// Absent on every pre-existing account, which should be treated as active.
export type TAccountStatus = "onboarding" | "pending_deposit" | "active";

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
export interface IAddress {
  house_number?: string | null;
  addr?: string | null;
  landmark?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
}

export interface IUpdateOnboardingPayload {
  dob?: string | null;
  gender?: TGender | null;
  social_media_links?: ISocialMediaLinks;
  address?: IAddress;
  bank_account_number?: string | null;
  ifsc_code?: string | null;
  pan?: string | null;
}

// Which setup steps are done. Derived server-side from the fields themselves,
// never stored, so the flags can't drift from what's actually filled in.
export interface IProfileCompletion {
  basic_details: boolean;
  bank_details: boolean;
  kyc_details: boolean;
  is_complete: boolean;
}

// Served by GET /user/profile. Kept off the GET /user bootstrap so bank and
// PAN details are only loaded by the one screen that edits them.
export interface IProfileDetails {
  dob?: string | null;
  gender?: TGender | null;
  social_media_links?: ISocialMediaLinks;
  address?: IAddress;
  bank_account_number?: string | null;
  ifsc_code?: string | null;
  pan?: string | null;
  completion: IProfileCompletion;
  // Present only when saving just completed onboarding and flipped the account.
  account_status?: TAccountStatus;
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
