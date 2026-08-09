import { z } from "zod";
import { JobTypeEnum, GenderEnum, MediaTypeEnum } from "@/interfaces/enum";

const jobMediaSchema = z.object({
  type: z.nativeEnum(MediaTypeEnum),
  url: z.string().url(),
});

const jobCategorySchema = z.object({
  l1: z.string().optional(),
  l2: z.string().optional(),
  l3: z.string().optional(),
  l4: z.string().optional(),
});

const earningBucketSchema = z.object({
  range: z.string().optional(),
  potential_earning: z.number().optional(),
});

const earningModelSchema = z.object({
  bucket_a: earningBucketSchema.optional(),
  bucket_b: earningBucketSchema.optional(),
  bucket_c: earningBucketSchema.optional(),
  bucket_d: earningBucketSchema.optional(),
});

const ageLimitSchema = z.object({
  lower: z.number().nullable(),
  upper: z.number().nullable(),
});

export const createJobSchema = z.object({
  job_type: z.enum([JobTypeEnum.AFFILIATE]),
  seller_id: z.string().min(1),
  product_id: z.string().min(1),
  product_link: z.string().url(),
  brand_name: z.string().optional(),
  preview_urls: z.array(jobMediaSchema).optional(),
  category: jobCategorySchema.optional(),
  earning_model: earningModelSchema.optional(),
  due_date: z.number().positive().optional(),
  age_limit: ageLimitSchema.optional(),
  gender: z.nativeEnum(GenderEnum).optional(),
});

export type ICreateJobPayload = z.infer<typeof createJobSchema>;

export const applyForJobSchema = z.object({
  job_short_id: z.string().min(1),
});

export type IApplyForJobPayload = z.infer<typeof applyForJobSchema>;

export const resolveLinkParamsSchema = z.object({
  shortId: z.string().min(1),
});
