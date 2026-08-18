export type TGender = "male" | "female";

export interface ISocialMediaLinks {
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
}

export interface IUser {
  _id: string;
  first_name: string;
  last_name: string;
  email?: string;
  user_profile_picture?: string;
  roles: string[];
  privileges: string[];

  // Influencer onboarding — absent until the creator fills the onboarding
  // form, so these are null rather than just missing.
  dob?: string | null;
  gender?: TGender | null;
  social_media_links?: ISocialMediaLinks | null;
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
