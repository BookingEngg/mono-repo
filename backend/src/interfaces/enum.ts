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

// Kept gateway-agnostic on purpose: PaymentProviderEnum is the only place a
// specific gateway name appears. Payment.provider_ref/provider_meta stay
// opaque so swapping gateways later only means adding a value here, not
// reshaping the payments schema.
export enum PaymentProviderEnum {
  RAZORPAY = "RAZORPAY",
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
