/**
 * Mirrors backend/src/interfaces/enum.ts (rolesEnum / privilegesEnum). Kept in
 * sync by hand since the two apps don't share a package — if the backend
 * renames or adds a role/privilege, update the matching literal here.
 */
export const ROLES = {
  USER: "roles/users",
  INFLUENCER: "roles/influencer",
  BRAND: "roles/brand",
  ADMIN: "roles/admin",
} as const;

export const PRIVILEGES = {
  DEFAULT_USER: "privilege/user/viewer",
  PROFILE: "privilege/user/profile/viewer",
  PROFILE_UPDATE: "privilege/user/profile/update",

  EXPLORE_JOBS: "privilege/influencer/jobs/viewer",
  APPLY_JOBS: "privilege/influencer/job-application/create",

  CREATE_JOBS: "privilege/brand/jobs/create",
  UPDATE_JOBS: "privilege/brand/jobs/update",
} as const;
