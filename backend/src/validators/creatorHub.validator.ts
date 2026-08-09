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

export const recordConversionSchema = z.object({
  id: z.string().min(1), // job application short_id
  conversion_type: z.enum(ConversionTriggerEnum),
  conversion_time: z.coerce.date(),
  visitor_id: z.string().min(1), // identifies the converting user/session, for dedupe
  order_id: z.string().optional(),
  awb_no: z.string().optional(),
});

export type IRecordConversionPayload = z.infer<typeof recordConversionSchema>;
