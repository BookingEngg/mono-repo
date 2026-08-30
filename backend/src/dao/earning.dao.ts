import { DB } from "@/database/postgres";
import { EarningStatusEnum } from "@/interfaces/enum";
import { EarningModel } from "@/models/earning.model";

class EarningDao {
  private earningModel = DB.Earning;

  /**
   * Records an accrual for a conversion, exactly once.
   *
   * `findOrCreate` rather than create-if-missing: brand webhooks retry, and a
   * retry can race the original. The unique index on
   * (job_application_short_id, visitor_id, trigger) is what actually enforces
   * this — the DB rejects the second insert, so two concurrent retries can't
   * both pay out.
   *
   * Returns `created: false` on a duplicate so callers can tell a real
   * accrual from a replay without treating the replay as an error.
   */
  public accrueForConversion = async (payload: {
    job_application_short_id: string;
    visitor_id?: string;
    trigger: string;
    event_source: string;
    user_id: string;
    seller_id?: string;
    amount: number;
    currency?: string;
    order_id?: string;
    awb_no?: string;
    recorded_at: Date;
  }): Promise<{ earning: EarningModel; created: boolean }> => {
    const [earning, created] = await this.earningModel.findOrCreate({
      where: {
        job_application_short_id: payload.job_application_short_id,
        visitor_id: payload.visitor_id ?? null,
        trigger: payload.trigger,
      } as any,
      defaults: {
        ...payload,
        currency: payload.currency ?? "INR",
        earning_status: EarningStatusEnum.ACCRUED,
      } as any,
    });

    return { earning, created };
  };

  public getEarningsByApplicationShortId = async (
    jobApplicationShortId: string,
  ) => {
    return await this.earningModel.findAll({
      where: { job_application_short_id: jobApplicationShortId } as any,
      order: [["recorded_at", "DESC"]],
    });
  };

  public getEarningsByUserId = async (
    userId: string,
    status?: EarningStatusEnum,
  ) => {
    return await this.earningModel.findAll({
      where: { user_id: userId, ...(status ? { earning_status: status } : {}) },
      order: [["created_at", "DESC"]],
    });
  };
}

export default EarningDao;
