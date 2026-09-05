import { z } from "zod";
import { GenderEnum } from "@/interfaces/enum";

// Each field is independently optional so a creator can fill the onboarding
// form partially and come back later — omitted fields are left untouched,
// but any that are sent as null explicitly clear a previously-set value.
const socialMediaLinksSchema = z.object({
  instagram: z.string().trim().min(1).nullable().optional(),
  facebook: z.string().trim().min(1).nullable().optional(),
  youtube: z.string().trim().min(1).nullable().optional(),
});

const addressSchema = z.object({
  house_number: z.string().trim().min(1).nullable().optional(),
  addr: z.string().trim().min(1).nullable().optional(),
  landmark: z.string().trim().min(1).nullable().optional(),
  city: z.string().trim().min(1).nullable().optional(),
  state: z.string().trim().min(1).nullable().optional(),
  // Six digits, first digit non-zero — India Post never issues a pincode
  // starting with 0. Kept as a string so the leading digits survive.
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6 digit pincode")
    .nullable()
    .optional(),
});

export const updateOnboardingSchema = z.object({
  dob: z.coerce.date().nullable().optional(),
  gender: z.nativeEnum(GenderEnum).nullable().optional(),
  social_media_links: socialMediaLinksSchema.optional(),

  address: addressSchema.optional(),

  // 9-18 digits covers every Indian bank's account number length.
  bank_account_number: z
    .string()
    .trim()
    .regex(/^[0-9]{9,18}$/, "Enter a valid bank account number")
    .nullable()
    .optional(),

  // RBI format: 4 letters, a reserved 0, then a 6 character branch code.
  // Uppercased before validating so a creator typing lowercase isn't rejected.
  ifsc_code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code")
    .nullable()
    .optional(),

  // Income Tax format: 5 letters, 4 digits, 1 letter.
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Enter a valid PAN")
    .nullable()
    .optional(),
});

export type IUpdateOnboardingPayload = z.infer<typeof updateOnboardingSchema>;
