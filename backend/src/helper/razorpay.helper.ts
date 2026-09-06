import {
  IConfigureRouteProductInput,
  ICreateLinkedAccountInput,
  ICreateStakeholderInput,
  IRouteAddress,
  IStakeholderAddress,
} from "@/interfaces/payment.interface";
import { IUser } from "@/interfaces/user.interface";
import { IAddress, IUserProfile } from "@/interfaces/userProfile.interface";

/**
 * Builds the request bodies for Razorpay's Route onboarding calls.
 *
 * Split from razorpay.http.ts so that file stays a transport: it signs a
 * request, sends the body it is handed, and reads the response. Everything
 * about the *shape* of that body — which fields Razorpay wants, what it
 * rejects, which keys have to be omitted rather than sent empty — lives here,
 * where it can be read and tested without a network call.
 */

/**
 * Razorpay rejects an empty address object, so an address with nothing usable
 * in it has to be dropped entirely rather than sent as `{}`.
 *
 * `country` is ISO 3166 alpha-2 uppercase ("IN"), matching Razorpay's own
 * documented payload.
 */
const buildAddress = (address?: IRouteAddress) => {
  if (!address) return undefined;

  const mapped = {
    street1: address.street1,
    street2: address.street2,
    city: address.city,
    state: address.state,
    postal_code: address.postal_code,
    country: (address.country || "IN").toUpperCase(),
  };

  const hasValue = Object.entries(mapped).some(
    ([key, value]) => key !== "country" && value,
  );

  return hasValue ? mapped : undefined;
};

/**
 * A stakeholder's residential address.
 *
 * Separate from buildAddress because Razorpay takes a single `street` here
 * where the account's registered address takes `street1`/`street2`. Same
 * omit-when-empty rule.
 */
const buildResidentialAddress = (address?: IStakeholderAddress) => {
  if (!address) return undefined;

  const mapped = {
    street: address.street,
    city: address.city,
    state: address.state,
    postal_code: address.postal_code,
    country: (address.country || "IN").toUpperCase(),
  };

  const hasValue = Object.entries(mapped).some(
    ([key, value]) => key !== "country" && value,
  );

  return hasValue ? mapped : undefined;
};

/**
 * Body for POST /v2/accounts — the creator's Route linked account.
 *
 * Mirrors Razorpay's documented payload field for field. Optional groups
 * (`profile`, `legal_info`) are omitted entirely rather than sent empty,
 * because Razorpay rejects an empty object where it accepts an absent key.
 */
export const createLinkedAccount = (
  input: ICreateLinkedAccountInput,
): Record<string, any> => {
  const registered = buildAddress(input.registered_address);

  const payload: Record<string, any> = {
    email: input.email,
    phone: input.phone,
    // Required, and the reason this account exists: "route" is what makes it
    // a settlement destination rather than a standalone merchant.
    type: "route",
    // Our creator id. Razorpay enforces uniqueness on it, so a retried
    // onboarding is rejected rather than quietly creating a second payout
    // account for the same person.
    reference_id: input.reference_id,
    legal_business_name: input.legal_business_name,
    business_type: input.business_type,
  };

  if (input.contact_name) {
    payload.contact_name = input.contact_name;
  }

  // Optional: Razorpay falls back to the legal name when it isn't sent.
  if (input.customer_facing_business_name) {
    payload.customer_facing_business_name = input.customer_facing_business_name;
  }

  if (input.business_category || input.business_subcategory || registered) {
    payload.profile = {
      ...(input.business_category ? { category: input.business_category } : {}),
      ...(input.business_subcategory
        ? { subcategory: input.business_subcategory }
        : {}),
      ...(registered ? { addresses: { registered } } : {}),
    };
  }

  if (input.pan || input.gst) {
    payload.legal_info = {
      ...(input.pan ? { pan: input.pan } : {}),
      ...(input.gst ? { gst: input.gst } : {}),
    };
  }

  return payload;
};

/**
 * Body for POST /v2/accounts/:accountId/stakeholders — the person behind the
 * account, for KYC.
 *
 * Mirrors Razorpay's documented payload. Every field past name and email is
 * optional and sent only when supplied: Razorpay validates these on shape, so
 * an empty string is a rejection where an absent key is fine.
 */
export const createStakeholder = (
  input: ICreateStakeholderInput,
): Record<string, any> => {
  const residential = buildResidentialAddress(input.residential_address);

  const payload: Record<string, any> = {
    name: input.name,
    email: input.email,
  };

  if (residential) payload.addresses = { residential };
  // Stakeholder KYC is the individual's PAN, distinct from the business PAN
  // sent as legal_info on the account.
  if (input.pan) payload.kyc = { pan: input.pan };
  if (input.notes) payload.notes = input.notes;

  if (input.percentage_ownership !== undefined) {
    payload.percentage_ownership = input.percentage_ownership;
  }
  if (input.relationship) payload.relationship = input.relationship;
  if (input.phone_primary) payload.phone = { primary: input.phone_primary };

  return payload;
};

/**
 * A creator's full name, as Razorpay should see it. Falls back to the first
 * name alone so a missing last name doesn't produce a trailing space.
 */
const buildCreatorName = (user: Pick<IUser, "first_name" | "last_name">) =>
  [user.first_name, user.last_name].filter(Boolean).join(" ").trim();

/**
 * Our address block onto Razorpay's registered-address shape.
 *
 * The two don't line up field for field: we store house_number, addr and
 * landmark where Razorpay takes street1/street2, so house number and street
 * are joined into street1 and the landmark becomes street2. `pincode` is
 * Razorpay's `postal_code`.
 */
const toRegisteredAddress = (address?: IAddress): IRouteAddress | undefined => {
  if (!address) return undefined;

  // Left undefined rather than "" when neither part is set — buildAddress
  // drops absent keys, and Razorpay rejects an empty street where it accepts
  // a missing one.
  const street1 =
    [address.house_number].filter(Boolean).join(", ").trim() || undefined;

  const street2 =
    [address.addr, address.landmark].filter(Boolean).join(", ").trim() ||
    undefined;

  return {
    street1,
    street2,
    city: address.city,
    state: address.state,
    postal_code: address.pincode,
    country: "IN",
  };
};

/**
 * Builds the POST /v2/accounts body straight from our own documents, so the
 * caller doesn't have to know Razorpay's field names to onboard a creator.
 *
 * A creator is always `business_type: "individual"` — they're a person being
 * paid, not a registered company — which is also why no GST is sent.
 *
 * The user's `_id` goes in as `reference_id`. Razorpay enforces uniqueness on
 * it, so if onboarding is retried after a partial failure, the second attempt
 * is rejected rather than quietly creating a duplicate payout account.
 */
export const createLinkedAccountForUser = (
  user: Pick<IUser, "_id" | "first_name" | "last_name" | "email" | "contact">,
  userProfile: Pick<IUserProfile, "pan" | "address" | "short_id">,
): Record<string, any> => {
  const name = buildCreatorName(user);

  const input: ICreateLinkedAccountInput = {
    email: user.email,
    phone: user.contact || "",
    reference_id: String(userProfile.short_id),
    legal_business_name: name,
    contact_name: name,
    business_type: "individual",
    registered_address: toRegisteredAddress(userProfile.address),
    // pan: userProfile.pan ?? undefined, // Not for the individual business type
    business_category: "ecommerce",
    business_subcategory: "ecommerce_marketplace",
  };

  return createLinkedAccount(input);
};

/**
 * Our address block onto Razorpay's residential-address shape.
 *
 * Note this collapses to a single `street`, where the account's registered
 * address takes street1/street2 — Razorpay's two address shapes differ, so
 * house number, street and landmark are all joined into one line here.
 */
const toResidentialAddress = (
  address?: IAddress,
): IStakeholderAddress | undefined => {
  if (!address) return undefined;

  return {
    street:
      [address.house_number, address.addr, address.landmark]
        .filter(Boolean)
        .join(", ")
        .trim() || undefined,
    city: address.city,
    state: address.state,
    postal_code: address.pincode,
    country: "IN",
  };
};

/**
 * Builds the POST /v2/accounts/:accountId/stakeholders body from our own
 * documents.
 *
 * The creator is the sole stakeholder in their own account, so this is where
 * their PAN goes: Razorpay takes KYC for an `individual` account on the
 * stakeholder, not as `legal_info` on the account itself.
 */
export const createStakeholderForUser = (
  user: Pick<IUser, "first_name" | "last_name" | "email">,
  userProfile: Pick<IUserProfile, "pan" | "address">,
): Record<string, any> => {
  const input: ICreateStakeholderInput = {
    name: buildCreatorName(user),
    email: user.email,
    residential_address: toResidentialAddress(userProfile.address),
    pan: userProfile.pan ?? undefined,
  };

  return createStakeholder(input);
};

/**
 * Body for POST /v2/accounts/:accountId/products — requests the Route product
 * on a linked account.
 *
 * Fixed payload, mirroring Razorpay's documented call. Route is the only
 * product we ask for, and the terms have to be accepted for Razorpay to start
 * its review — sending `tnc_accepted: false` leaves the product stuck.
 */
export const createProduct = (): Record<string, any> => ({
  product_name: "route",
  tnc_accepted: true,
});

/** Body for PATCH /v2/accounts/:accountId/products/:productId. */
export const configureProduct = (
  input: IConfigureRouteProductInput,
): Record<string, any> => ({
  settlements: {
    account_number: input.account_number,
    // Razorpay rejects a lowercase IFSC and creators type it either way, so
    // it's normalised here rather than at every call site.
    ifsc_code: input.ifsc_code?.toUpperCase(),
    ...(input.beneficiary_name
      ? { beneficiary_name: input.beneficiary_name }
      : {}),
  },
  tnc_accepted: input.tnc_accepted ?? true,
});

/**
 * Builds the PATCH /v2/accounts/:accountId/products/:productId body from our
 * own documents — the creator's bank details, which is what Razorpay actually
 * reviews before it will settle money to them.
 *
 * The beneficiary name is the creator's own name rather than anything stored
 * separately: for an individual account the payee and the account holder are
 * the same person, and a mismatch here is a common cause of a rejected
 * settlement.
 */
export const configureProductForUser = (
  user: Pick<IUser, "first_name" | "last_name">,
  userProfile: Pick<IUserProfile, "bank_account_number" | "ifsc_code">,
): Record<string, any> => {
  const input: IConfigureRouteProductInput = {
    account_number: userProfile.bank_account_number ?? "",
    ifsc_code: userProfile.ifsc_code ?? "",
    beneficiary_name: buildCreatorName(user),
  };

  return configureProduct(input);
};
