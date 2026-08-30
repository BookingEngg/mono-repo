import { nanoid } from "nanoid";
import { Schema } from "mongoose";
import { MONGO_INSTANCES } from "@/database";
import { IJobApplication } from "@/interfaces/jobApplication.interface";
import {
  JobApplicationStatusEnum,
  JobTypeEnum,
  EarningModelTypeEnum,
  ConversionTriggerEnum,
} from "@/interfaces/enum";

const dbConnection = MONGO_INSTANCES.praman;

const JobApplicationSchema: Schema<IJobApplication> = new Schema(
  {
    short_id: { type: String }, // unique short id for the application
    job_short_id: { type: String, required: true }, // against a job short id
    user_id: { type: String, required: true }, // influencer applying for the job
    job_type: { type: String, enum: JobTypeEnum, required: true },

    job_details: {
      type: new Schema(
        {
          seller_id: { type: String, required: true },
          product_id: { type: String, required: true },
          product_link: { type: String },
          category: {
            _id: false,
            l1: { type: String },
            l2: { type: String },
            l3: { type: String },
            l4: { type: String },
          },
          earning_model: {
            _id: false,
            type: { type: String, enum: EarningModelTypeEnum, required: true },
            value: { type: Number, required: true, min: 0 },
            conversion_trigger: {
              type: String,
              enum: ConversionTriggerEnum,
              required: true,
            },
          },
          // snapshotted with earning_model — a PERCENTAGE cut only means
          // something against the price it was quoted at
          selling_price: { type: Number, min: 0 },
          due_date: { type: Number },
        },
        { _id: false },
      ),
      required: true,
    },

    // product_sourcing job fields
    order_id: { type: String },
    awb_no: { type: String },

    // affiliate job fields
    link_short_id: { type: String },

    order_status: {
      type: String,
      enum: JobApplicationStatusEnum,
      required: true,
    },

    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

JobApplicationSchema.pre("save", function (next) {
  if (!this.short_id) {
    this.short_id = nanoid(8);
  }
  next();
});

JobApplicationSchema.index({ short_id: 1 });
JobApplicationSchema.index({ job_short_id: 1 });
JobApplicationSchema.index({ user_id: 1 });
JobApplicationSchema.index({ order_id: 1 });
JobApplicationSchema.index({ visitor_ids: 1 });
JobApplicationSchema.index({ createdAt: -1 });

const JobApplicationModel = dbConnection.model(
  "job_applications",
  JobApplicationSchema,
);
export default JobApplicationModel;
