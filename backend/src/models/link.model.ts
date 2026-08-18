import { nanoid } from "nanoid";
import { Schema } from "mongoose";
import { MONGO_INSTANCES } from "@/database";
import { ILink } from "@/interfaces/link.interface";
import { LinkEntityType } from "@/interfaces/enum";

const dbConnection = MONGO_INSTANCES.praman;

const LinkSchema: Schema<ILink> = new Schema(
  {
    short_id: { type: String },
    destination_url: { type: String, required: true },

    entity_type: { type: String, enum: LinkEntityType },
    entity_id: { type: String },

    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

LinkSchema.pre("save", function (next) {
  if (!this.short_id) {
    this.short_id = nanoid(8);
  }
  next();
});

LinkSchema.index({ short_id: 1 }, { unique: true });
LinkSchema.index({ entity_type: 1, entity_id: 1 });

const LinkModel = dbConnection.model("links", LinkSchema);
export default LinkModel;
