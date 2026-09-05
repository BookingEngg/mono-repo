export enum OAuthClients {
  GOOGLE = "google",
  GITHUB = "github",
}

export enum CommunicationType {
  Private = "private",
  Group = "group",
}

export enum GroupType {
  Private = "private",
  Public = "public",
}

export enum GenderEnum {
  MALE = "male",
  FEMALE = "female",
}

export enum JobTypeEnum {
  AFFILIATE = "affiliate",
  PRODUCT_SOURCING = "product_sourcing",
}

export enum MediaTypeEnum {
  IMAGE = "image",
  VIDEO = "video",
}

export enum LinkEntityType {
  JOB_APPLICATION = "job_application",
}

export enum EarningModelTypeEnum {
  PERCENTAGE = "PERCENTAGE",
  FIXED_PER_ORDER = "FIXED_PER_ORDER",
  CPC = "CPC",
}

export enum ConversionTriggerEnum {
  LINK_CLICK = "LINK_CLICK",
  PDP_VIEW = "PDP_VIEW",
  ORDER_PLACED = "ORDER_PLACED",
  CANCELLED = "CANCELLED",
  ORDER_DISPATCH = "ORDER_DISPATCH",
  DELIVERED = "DELIVERED",
}

export enum ConversionEventSourceEnum {
  BRAND = "BRAND", // reported by the brand's own webhook call
  INHOUSE = "INHOUSE", // inferred/recorded by our own systems (e.g. click tracking)
}

export enum JobApplicationStatusEnum {
  ENQUEUED = "enqueued",
  PENDING = "pending",
  APPLIED = "applied",
  CANCELLED = "cancelled",
  CLOSED = "closed",
}

export enum rolesEnum {
  USER = "roles/users",
  INFLUENCER = "roles/influencer",
  BRAND = "roles/brand",
  ADMIN = "roles/admin",
}

export enum UserTypeEnum {
  INFLUENCER = "influencer",
  BRAND = "brand",
}

// Lifecycle of the account itself, separate from roles/privileges. A brand
// created via the signup form starts "onboarding" (pending email
// verification) and flips to "active" once that step completes. Anything
// other than a strict "onboarding" match is treated as active — existing
// docs from before this field existed never need a migration.
export enum AccountStatusEnum {
  // Brand signed up but hasn't verified its email yet. Locked to the
  // onboarding screen — nothing else in the app is reachable.
  ONBOARDING = "onboarding",
  // Email verified, security deposit not paid. The account is usable
  // (it can sign in, browse, and reach the deposit widget) but can't post
  // jobs until the deposit settles.
  PENDING_DEPOSIT = "pending_deposit",
  // Fully activated: email verified and deposit paid.
  ACTIVE = "active",
}

// Kept gateway-agnostic on purpose: PaymentProviderEnum is the only place a
// specific gateway name appears. Payment.provider_ref/provider_meta stay
// opaque so swapping gateways later only means adding a value here, not
// reshaping the payments schema.
export enum PaymentProviderEnum {
  RAZORPAY = "RAZORPAY",
}

/**
 * How a settlement payment is scoped. Settlement is per creator: a brand pays
 * one creator everything currently owed to them, across every job.
 *
 * Kept as an enum rather than dropped entirely so adding another slice later
 * doesn't mean reshaping the payment payload.
 */
export enum SettlementScopeEnum {
  CREATOR = "creator",
}

export enum PaymentTypeEnum {
  SECURITY_DEPOSIT = "security_deposit",
  ONLINE = "online",
}

export enum PaymentStatusEnum {
  INITIATED = "initiated",
  SUCCESS = "success",
  PENDING = "pending",
  FAILED = "failed",
}

// Lifecycle of one earning ledger row — separate from PaymentStatusEnum,
// which tracks the payment transaction itself, not the underlying earning
// entry it eventually settles.
export enum EarningStatusEnum {
  ACCRUED = "accrued", // creator earned it, not yet rolled into a billing cycle
  BILLED = "billed", // included in a closed billing cycle, not yet paid
  PAID = "paid", // the payment for this entry succeeded
  REVERSED = "reversed", // underlying order/conversion was cancelled before payout
}

/**
 * Cards the home screen renders. The backend decides which ones a given
 * account sees (and whether each is already done), so adding a widget never
 * means teaching the client a new role rule.
 */
export enum HomeWidgetEnum {
  SECURITY_DEPOSIT = "security_deposit",
  POST_JOB = "post_job",

  // Creator setup prompts. Split into three rather than one "complete your
  // profile" card because they're filled at different times — a creator can
  // start applying to jobs before they've got bank details to hand.
  UPDATE_PROFILE = "update_profile",
  UPDATE_BANK_DETAILS = "update_bank_details",
  UPDATE_KYC_DETAILS = "update_kyc_details",
}

/**
 * What tapping a widget does. Kept as a small closed vocabulary rather than a
 * server-sent URL: the client owns its own routing, and a server-supplied
 * path would be both brittle across clients and an open redirect risk.
 */
export enum HomeWidgetActionEnum {
  PAYMENT_CHECKOUT = "payment_checkout",
  CREATE_JOB = "create_job",
  // All three creator setup widgets land on the profile page; `section` says
  // which accordion to open, so the client doesn't infer it from the id.
  OPEN_PROFILE = "open_profile",
}

/**
 * The collapsible sections of the profile page. Named server-side so a widget
 * can point at one without the client mapping widget ids to sections.
 */
export enum ProfileSectionEnum {
  BASIC_DETAILS = "basic_details",
  BANK_DETAILS = "bank_details",
  KYC_DETAILS = "kyc_details",
}

export enum privilegesEnum {
  // User Priviledges
  DEFAULT_USER = "privilege/user/viewer",
  PROFILE = "privilege/user/profile/viewer",
  PROFILE_UPDATE = "privilege/user/profile/update",

  // Influencer Priviledges
  EXPLORE_JOBS = "privilege/influencer/jobs/viewer",
  APPLY_JOBS = "privilege/influencer/job-application/create",

  // Brand Priviledges
  CREATE_JOBS = "privilege/brand/jobs/create",
  UPDATE_JOBS = "privilege/brand/jobs/update",
}
