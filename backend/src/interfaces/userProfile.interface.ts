import { ISocialMediaLinks } from "./user.interface";

export interface IAddress {
  house_number?: string;
  addr?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

/**
 * Profile details kept OUT of the user document.
 *
 * Two reasons for the split. First, payout details (bank account, IFSC, PAN)
 * are sensitive in a way the rest of the user record isn't — the user doc is
 * read on every authenticated request by AuthMiddleware, and widening that
 * to carry account numbers would put them in memory on every call. Second,
 * these are filled in once at payout setup, not on signup, so most users
 * would carry empty columns.
 *
 * One profile per user, enforced by a unique index on user_id.
 */
export interface IUserProfile {
  _id?: string;
  // References users._id. Stored as a string like every other cross-document
  // reference in this codebase rather than an ObjectId ref.
  user_id: string;

  // Payout destination. Optional because a creator can use the app long
  // before they set up how they get paid.
  bank_account_number?: string | null;
  ifsc_code?: string | null;
  pan?: string | null;

  address?: IAddress;

  // Moved off the user document — it belongs with the rest of the profile.
  social_media_links?: ISocialMediaLinks;

  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Which setup steps a creator has finished. Derived, never stored — storing
 * it would let the flags drift out of sync with the fields they describe.
 */
export interface IProfileCompletion {
  basic_details: boolean;
  bank_details: boolean;
  kyc_details: boolean;
  is_complete: boolean;
}
