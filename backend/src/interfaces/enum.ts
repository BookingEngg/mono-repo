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
}

export enum rolesEnum {
  USER = "roles/users",
  BRAND = "roles/brand",
  ADMIN = "roles/admin",
}

// The account type a creator picks at signup; distinct from rolesEnum, which
// is the internal access-control representation it maps to.
export enum UserTypeEnum {
  USER = "user",
  BRAND = "brand",
}

export enum privilegesEnum {
  DEFAULT = "privilege/user/viewer",

  PROFILE = "privilege/user/profile/viewer",
  PROFILE_UPDATE = "privilege/user/profile/update",

  EXPLORE_JOBS = "privilege/user/jobs/viewer",

  CREATE_JOBS = "privilege/brand/jobs/create",
  UPDATE_JOBS = "privilege/brand/jobs/update",
}
