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
