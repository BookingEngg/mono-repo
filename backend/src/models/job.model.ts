import { nanoid } from "nanoid";
import { Schema } from "mongoose";
import { MONGO_INSTANCES } from "@/database";
import { IJob } from "@/interfaces/job.interface";
import {
  GenderEnum,
  JobTypeEnum,
  MediaTypeEnum,
  EarningModelTypeEnum,
  ConversionTriggerEnum,
} from "@/interfaces/enum";

const dbConnection = MONGO_INSTANCES.praman;

const JobSchema: Schema<IJob> = new Schema(
  {
    short_id: { type: String }, // identifier
    job_type: { type: String, enum: JobTypeEnum, required: true },

    brand_name: { type: String },
    product_link: { type: String, required: true },
    preview_urls: [
      {
        _id: false,
        type: { type: String, enum: MediaTypeEnum, required: true },
        url: { type: String, required: true },
      },
    ],

    seller_id: { type: String, required: true },
    product_id: { type: String, required: true },

    category: {
      _id: false,
      l1: { type: String },
      l2: { type: String },
      l3: { type: String },
      l4: { type: String },
    },

    job_count: {
      available: { type: Number, default: 3, min: 0 },
      completed: { type: Number, default: 0, min: 0 },
    },

    earning_model: {
      _id: false,

      type: {
        type: String,
        enum: EarningModelTypeEnum,
        required: true,
      },

      value: {
        type: Number,
        required: true,
        min: 0,
      },

      conversion_trigger: {
        type: String,
        enum: ConversionTriggerEnum,
        required: true,
      },
    },

    due_date: { type: Number, default: 3 },

    age_limit: {
      _id: false,
      lower: { type: Number, default: null },
      upper: { type: Number, default: null },
    },
    gender: { type: String, enum: GenderEnum },

    is_active: { type: Boolean, default: true },
    is_visible: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

JobSchema.pre("save", function (next) {
  if (!this.short_id) {
    this.short_id = nanoid(8);
  }
  next();
});

JobSchema.index({ short_id: 1 });

const JobModel = dbConnection.model("jobs", JobSchema);
export default JobModel;
