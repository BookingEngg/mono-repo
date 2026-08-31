import { literal, Op } from "sequelize";
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

  /** One row per creator who has earned from this brand. */
  public getSettlementByCreator = async (sellerId: string) => {
    return (await this.earningModel.findAll({
      attributes: [
        "user_id",
        this.sumWhereStatus([EarningStatusEnum.PAID], "settled_amount"),
        this.sumWhereStatus(
          [EarningStatusEnum.ACCRUED, EarningStatusEnum.BILLED],
          "pending_amount",
        ),
        this.sumWhereStatus([EarningStatusEnum.REVERSED], "reversed_amount"),
        [literal("COUNT(id)"), "conversion_count"],
        // literal, not fn("DISTINCT", ...) — Sequelize would emit
        // COUNT(DISTINCT(x)) as a nested function call, not the SQL keyword.
        [literal("COUNT(DISTINCT job_short_id)"), "job_count"],
      ] as any,
      where: { seller_id: sellerId } as any,
      group: ["user_id"],
      raw: true,
    })) as unknown as Record<string, unknown>[];
  };

  /**
   * What a settlement slice is worth, as an aggregate — no rows loaded.
   *
   * `asOf` is the cutoff that makes a settlement safe: conversions keep
   * accruing while the brand is away at the gateway, so both this and the
   * later mark-as-paid filter on `created_at <= asOf`. Same predicate, same
   * set — anything that lands afterwards belongs to the next settlement.
   *
   * Capture `asOf` BEFORE calling this, not from inside: deriving it here
   * would let a row slip in between the timestamp and the SUM.
   */
  public getPendingSettlementSummary = async (
    sellerId: string,
    _scope: SettlementScopeEnum,
    reference: string,
    asOf: Date,
  ): Promise<{
    pending_amount: number;
    job_count: number;
    conversion_count: number;
  }> => {
    const [row] = (await this.earningModel.findAll({
      attributes: [
        [literal("COALESCE(SUM(amount), 0)"), "pending_amount"],
        [literal("COUNT(DISTINCT job_short_id)"), "job_count"],
        [literal("COUNT(id)"), "conversion_count"],
      ] as any,
      where: this.pendingSliceWhere(sellerId, reference, asOf),
      raw: true,
    })) as unknown as Record<string, unknown>[];

    // Postgres hands SUM over DECIMAL back as a string rather than narrowing
    // to a float and losing precision, so these have to be parsed.
    return {
      pending_amount: Number(row?.pending_amount ?? 0),
      job_count: Number(row?.job_count ?? 0),
      conversion_count: Number(row?.conversion_count ?? 0),
    };
  };

  /**
   * The predicate shared by pricing and settling. Keeping it in one place is
   * what guarantees the two can't drift — if they did, a brand could be
   * charged for one set of earnings and have a different set marked paid.
   *
   * Settlement is per creator, so `reference` is always a user id. The scope
   * parameter stays in the public signatures so adding another slice later
   * doesn't ripple through every call site.
   */
  private pendingSliceWhere = (
    sellerId: string,
    reference: string,
    asOf: Date,
  ) =>
    ({
      seller_id: sellerId,
      user_id: reference,
      earning_status: [
        EarningStatusEnum.ACCRUED,
        EarningStatusEnum.BILLED,
      ] as any,
      created_at: { [Op.lte]: asOf },
    }) as any;

  /**
   * Settles a whole slice in one set-based UPDATE.
   *
   * Still scoped to unpaid rows, so a replayed webhook re-runs the same
   * statement and updates nothing rather than double-settling. Returns the
   * row count so a caller can tell a real settlement from a replay.
   */
  public markPendingEarningsPaid = async (
    sellerId: string,
    scope: SettlementScopeEnum,
    reference: string,
    asOf: Date,
    paymentId: number,
  ) => {
    const [affectedRows] = await this.earningModel.update(
      { earning_status: EarningStatusEnum.PAID, payment_id: paymentId } as any,
      { where: this.pendingSliceWhere(sellerId, reference, asOf) },
    );

    return affectedRows;
  };
}

export default EarningDao;
