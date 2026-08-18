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

export const updateOnboardingSchema = z.object({
  dob: z.coerce.date().nullable().optional(),
  gender: z.nativeEnum(GenderEnum).nullable().optional(),
  social_media_links: socialMediaLinksSchema.optional(),
});

export type IUpdateOnboardingPayload = z.infer<typeof updateOnboardingSchema>;
