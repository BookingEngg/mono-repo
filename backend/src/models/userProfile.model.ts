import { Schema } from "mongoose";
import { MONGO_INSTANCES } from "@/database";
import { RouteStatusEnum } from "@/interfaces/enum";
import { IUserProfile } from "@/interfaces/userProfile.interface";
import { nanoid } from "nanoid";

const dbConnection = MONGO_INSTANCES.praman;

// Influencer social handles. Lives on the user_profiles document now, not
// here — this stays exported because that model reuses the sub-schema.
export const ISocialMediaLinks = new Schema(
  {
    instagram: { type: String, default: null },
    facebook: { type: String, default: null },
    youtube: { type: String, default: null },
  },
  { _id: false },
);

export const IAddress = new Schema(
  {
    house_number: { type: String, default: null },
    addr: { type: String, default: null },
    landmark: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    // String, not Number: pincodes are identifiers, not quantities — "110091"
    // must never be arithmetic, and a leading zero would be lost as a number.
    pincode: { type: String, default: null },
  },
  { _id: false },
);

/**
 * Profile details kept off the user document — see IUserProfile for why.
 *
 * Payout fields are deliberately NOT selected by default: the user record is
 * loaded on every authenticated request, and anything that joins it should
 * have to ask for account numbers explicitly rather than get them by accident.
 */
const UserProfileSchema: Schema<IUserProfile> = new Schema(
  {
    short_id: { type: String, required: true },
    user_id: { type: String, required: true },

    bank_account_number: { type: String, default: null },
    ifsc_code: { type: String, default: null },
    pan: { type: String, default: null },

    address: { type: IAddress, default: () => ({}) },

    // Razorpay Route linked account id, set once onboarding succeeds.
    razorpay_account_id: { type: String, default: null },

    // Razorpay stakeholder id, set once the stakeholder is created.
    razorpay_stakeholder_id: { type: String, default: null },

    // Razorpay Route product id, set once the product is requested.
    razorpay_product_id: { type: String, default: null },

    // Route activation state — READY once Razorpay activates the product.
    razorpay_route_status: {
      type: String,
      enum: RouteStatusEnum,
      default: null,
    },

    // Moved here from the user model.
    social_media_links: { type: ISocialMediaLinks, default: () => ({}) },
  },
  {
    timestamps: true,
  },
);

UserProfileSchema.pre("save", function (next) {
  if (!this.short_id) {
    this.short_id = nanoid(15);
  }
  next();
});

// One profile per user — the whole model is a 1:1 extension of the user doc,
// so a second row would silently split a person's details in two.
UserProfileSchema.index({ user_id: 1 }, { unique: true });

const UserProfileModel = dbConnection.model(
  "user_profiles",
  UserProfileSchema,
);
export default UserProfileModel;
