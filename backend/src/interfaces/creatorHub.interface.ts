// re-exported so callers can keep importing payload types from here;
// the zod schemas in creatorHub.validator.ts are the source of truth
export type {
  ICreateJobPayload,
  IApplyForJobPayload,
} from "@/validators/creatorHub.validator";

export interface IPaginationParams {
  page: number;
  limit: number;
}

export interface IPaginatedResult<T> {
  data: T[];
  meta: { count: number };
}
