import { literal } from "sequelize";
import { DB } from "@/database/postgres";
import { EarningStatusEnum, SettlementScopeEnum } from "@/interfaces/enum";
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
    job_short_id?: string;
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

  /**
   * Settled vs pending, aggregated in SQL rather than by loading rows into
   * memory — a brand's earnings grow with every conversion, so the report has
   * to stay flat as that number climbs.
   *
   * `paid` is settled. `accrued` and `billed` both roll into pending: from a
   * brand's side, "invoiced but not yet transferred" is not settled money.
   * `reversed` is reported separately and excluded from both — it was
   * cancelled, so counting it as either owed or paid would overstate the bill.
   */
  private sumWhereStatus = (statuses: EarningStatusEnum[], alias: string) => {
    const list = statuses.map((status) => `'${status}'`).join(", ");
    return [
      literal(
        `COALESCE(SUM(CASE WHEN earning_status IN (${list}) THEN amount ELSE 0 END), 0)`,
      ),
      alias,
    ] as [ReturnType<typeof literal>, string];
  };

  private runSettlementAggregate = async (
    sellerId: string,
    groupColumn: "job_short_id" | "user_id",
    distinctColumn: "user_id" | "job_short_id",
    distinctAlias: string,
  ) => {
    return (await this.earningModel.findAll({
      attributes: [
        groupColumn,
        this.sumWhereStatus([EarningStatusEnum.PAID], "settled_amount"),
        this.sumWhereStatus(
          [EarningStatusEnum.ACCRUED, EarningStatusEnum.BILLED],
          "pending_amount",
        ),
        this.sumWhereStatus([EarningStatusEnum.REVERSED], "reversed_amount"),
        [literal("COUNT(id)"), "conversion_count"],
        // literal, not fn("DISTINCT", ...) — Sequelize would emit
        // COUNT(DISTINCT(x)) as a nested function call, not the SQL keyword.
        [literal(`COUNT(DISTINCT ${distinctColumn})`), distinctAlias],
      ] as any,
      where: { seller_id: sellerId } as any,
      group: [groupColumn],
      raw: true,
    })) as unknown as Record<string, unknown>[];
  };

  /**
   * The pending (unpaid) earnings in one settlement slice.
   *
   * Returns the rows themselves, not just a sum, because the caller has to
   * pin down WHICH earnings a payment covers: conversions keep accruing while
   * the brand is at the gateway, and marking "everything pending" as paid
   * afterwards would settle rows the brand never paid for.
   */
  public getPendingEarnings = async (
    sellerId: string,
    scope: SettlementScopeEnum,
    reference: string,
  ) => {
    const scopeColumn =
      scope === SettlementScopeEnum.JOB ? "job_short_id" : "user_id";

    return await this.earningModel.findAll({
      where: {
        seller_id: sellerId,
        [scopeColumn]: reference,
        earning_status: [
          EarningStatusEnum.ACCRUED,
          EarningStatusEnum.BILLED,
        ] as any,
      } as any,
      order: [["created_at", "ASC"]],
    });
  };

  /**
   * Settles an exact set of earnings against a payment.
   *
   * Scoped to still-unpaid rows so a replayed webhook can't re-settle an
   * earning that a different payment already covered — the same terminal
   * guard the payments table uses. Returns the row count so callers can spot
   * a partial match instead of assuming success.
   */
  public markEarningsPaid = async (earningIds: number[], paymentId: number) => {
    if (!earningIds.length) {
      return 0;
    }

    const [affectedRows] = await this.earningModel.update(
      { earning_status: EarningStatusEnum.PAID, payment_id: paymentId } as any,
      {
        where: {
          id: earningIds as any,
          earning_status: [
            EarningStatusEnum.ACCRUED,
            EarningStatusEnum.BILLED,
          ] as any,
        } as any,
      },
    );

    return affectedRows;
  };

  /** One row per job the brand has earnings against. */
  public getSettlementByJob = async (sellerId: string) =>
    this.runSettlementAggregate(
      sellerId,
      "job_short_id",
      "user_id",
      "creator_count",
    );

  /** One row per creator who has earned from this brand. */
  public getSettlementByCreator = async (sellerId: string) =>
    this.runSettlementAggregate(
      sellerId,
      "user_id",
      "job_short_id",
      "job_count",
    );
}

export default EarningDao;
