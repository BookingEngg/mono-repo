import { nanoid } from "nanoid";
import { Schema } from "mongoose";
import { MONGO_INSTANCES } from "@/database";
import { IConversion } from "@/interfaces/conversion.interface";
import { ConversionTriggerEnum, ConversionEventSourceEnum } from "@/interfaces/enum";

const dbConnection = MONGO_INSTANCES.praman;

const ConversionSchema: Schema<IConversion> = new Schema(
  {
    visitor_id: { type: String }, // BRAND events only

    short_id: { type: String }, // unique short id — doubles as the session id for INHOUSE clicks
    job_application_short_id: { type: String, required: true },

    trigger: { type: String, enum: ConversionTriggerEnum, required: true },
    event_source: {
      type: String,
      enum: ConversionEventSourceEnum,
      required: true,
    },

    order_id: { type: String },
    awb_no: { type: String },
    recorded_at: { type: Date, required: true },
  },
  {
    timestamps: true,
  },
);

ConversionSchema.pre("save", function (next) {
  if (!this.short_id) {
    this.short_id = nanoid(8);
  }
  next();
});

ConversionSchema.index({ short_id: 1 });
ConversionSchema.index({ job_application_short_id: 1 });
// one visitor can only register the same BRAND-reported event once per application
ConversionSchema.index(
  { job_application_short_id: 1, visitor_id: 1, trigger: 1 },
  { unique: true, partialFilterExpression: { visitor_id: { $exists: true } } },
);

const ConversionModel = dbConnection.model("conversions", ConversionSchema);
export default ConversionModel;
