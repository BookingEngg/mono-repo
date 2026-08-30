import { z } from "zod";
import {
  JobTypeEnum,
  GenderEnum,
  MediaTypeEnum,
  EarningModelTypeEnum,
  ConversionTriggerEnum,
} from "@/interfaces/enum";

const jobMediaSchema = z.object({
  type: z.enum(MediaTypeEnum),
  url: z.string(),
});

const jobCategorySchema = z.object({
  l1: z.string().optional(),
  l2: z.string().optional(),
  l3: z.string().optional(),
  l4: z.string().optional(),
});

const earningModelSchema = z.object({
  type: z.enum(EarningModelTypeEnum),
  value: z.number().min(0),
  conversion_trigger: z.enum(ConversionTriggerEnum),
});

const ageLimitSchema = z.object({
  lower: z.number().nullable(),
  upper: z.number().nullable(),
});

export const createJobSchema = z.object({
  job_type: z.enum([JobTypeEnum.AFFILIATE]),
  product_id: z.string().min(1).max(50),
  product_name: z.string().min(1).max(200),
  // Required for new jobs: a PERCENTAGE commission can't be shown as a
  // real figure without it.
  selling_price: z.number().positive(),
  product_link: z.string().url(),
  preview_urls: z.array(jobMediaSchema).optional(),
  category: jobCategorySchema.optional(),
  earning_model: earningModelSchema.optional(),
  due_date: z.number().positive().optional(),
  age_limit: ageLimitSchema.optional(),
  gender: z.nativeEnum(GenderEnum).optional(),
});

export type ICreateJobPayload = z.infer<typeof createJobSchema>;

export const listJobsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type IListJobsQuery = z.infer<typeof listJobsQuerySchema>;

export const applyForJobSchema = z.object({
  job_short_id: z.string().min(1),
});

export type IApplyForJobPayload = z.infer<typeof applyForJobSchema>;

export const resolveLinkParamsSchema = z.object({
  shortId: z.string().min(1),
});

// echoed back by the brand from the utm params we appended to the redirect —
// utm_campaign carries the job application id, utm_medium the session id
const utmParamsSchema = z.object({
  utm_source: z.string(),
  utm_campaign: z.string().min(1), // job application short_id
  utm_medium: z.string().min(1), // session id, used as the dedupe identifier
});

const eventDatumSchema = z.object({
  conversion_type: z.enum(ConversionTriggerEnum),
  conversion_time: z.coerce.date(),
  order_id: z.string().optional(),
  awb_no: z.string().optional(),
});

export const recordConversionSchema = z.object({
  utm_params: utmParamsSchema,
  event_datum: eventDatumSchema,
});

export type IRecordConversionPayload = z.infer<typeof recordConversionSchema>;
