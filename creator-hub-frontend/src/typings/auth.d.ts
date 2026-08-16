export interface IUser {
  _id: string;
  first_name: string;
  last_name: string;
  email?: string;
  user_profile_picture?: string;
  role: string;
  roles: string[];
  privileges: string[];
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
export type TUserType = "user" | "brand";
