import { nanoid } from "nanoid";
import { IConversion } from "@/interfaces/conversion.interface";
import ConversionModel from "@/models/conversion.model";

class ConversionDao {
  private conversionModel = ConversionModel;

  // Plain insert — used for the first inhouse click of a session, where the
  // caller needs the generated short_id back to set as the session cookie.
  public createConversion = async (payload: Partial<IConversion>) => {
    return await this.conversionModel.create(payload);
  };

  // Atomically records a BRAND-reported conversion only once per
  // (job_application_short_id, visitor_id, trigger) — a single upsert,
  // not a separate find followed by a create.
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
