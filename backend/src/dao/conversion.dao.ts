import { nanoid } from "nanoid";
import { IConversion } from "@/interfaces/conversion.interface";
import ConversionModel from "@/models/conversion.model";

class ConversionDao {
  private conversionModel = ConversionModel;

  // Atomically records a conversion only once per
  // (job_application_short_id, visitor_id, trigger) — a single upsert,
  // not a separate find followed by a create. Used for both BRAND events
  // (visitor_id from the brand) and INHOUSE click tracking (visitor_id is
  // the session id).
  public upsertConversionForVisitor = async (payload: Partial<IConversion>) => {
    const { job_application_short_id, trigger, visitor_id } = payload;

    return await this.conversionModel.updateOne(
      { job_application_short_id, trigger, visitor_id },
      { $setOnInsert: { ...payload, short_id: nanoid(8) } },
      { upsert: true },
    );
  };

  public getConversionsByApplicationShortId = async (
    jobApplicationShortId: string,
  ) => {
    return await this.conversionModel
      .find({ job_application_short_id: jobApplicationShortId })
      .sort({ recorded_at: -1 })
      .lean();
  };
}

export default ConversionDao;
