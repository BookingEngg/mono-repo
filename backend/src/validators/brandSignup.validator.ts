import { z } from "zod";

// The brand's small onboarding form — display name, contact email, and a
// contact number. Deliberately minimal: everything else (profile picture,
// verification) happens later in the onboarding step, not at signup.
export const brandSignupSchema = z.object({
  brand_name: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
  contact: z.string().trim().min(1),
});

export type IBrandSignupPayload = z.infer<typeof brandSignupSchema>;
