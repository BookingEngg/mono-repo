import EarningDao from "@/dao/earning.dao";
import JobDao from "@/dao/job.dao";
import UserDao from "@/dao/user.dao";
import { IUser } from "@/interfaces/user.interface";
import {
  ISettlementByCreatorRow,
  ISettlementByJobRow,
  ISettlementSummary,
} from "@/interfaces/settlement.interface";

// Postgres returns SUM/COUNT over DECIMAL as strings (node-postgres won't
// silently narrow a numeric to a float64 and lose precision), so every
// aggregate has to be parsed rather than used directly.
const toNumber = (value: unknown): number => Number(value ?? 0);

class SettlementService {
  private earningDao = new EarningDao();
  private jobDao = new JobDao();
  private userDao = new UserDao();

  private buildSummary = (
    rows: { settled_amount: number; pending_amount: number }[],
  ): ISettlementSummary =>
    rows.reduce<ISettlementSummary>(
      (summary, row) => ({
        settled_amount: summary.settled_amount + row.settled_amount,
        pending_amount: summary.pending_amount + row.pending_amount,
        total_amount:
          summary.total_amount + row.settled_amount + row.pending_amount,
      }),
      { settled_amount: 0, pending_amount: 0, total_amount: 0 },
    );

  /**
   * Settled vs pending per job, for the brand's own jobs only.
   *
   * Product names aren't stored on the earning — they're resolved from the
   * Job documents in one batched lookup, so the report reflects the job as it
   * is now and a rename doesn't need backfilling across every earning row.
   */
  public getSettlementByJob = async (brand: IUser) => {
    const rows = await this.earningDao.getSettlementByJob(String(brand._id));

    const jobShortIds = rows
      .map((row) => row.job_short_id as string)
      .filter(Boolean);

    const jobs = jobShortIds.length
      ? await this.jobDao.getJobsByShortIds(jobShortIds, [
          "short_id",
          "product_name",
          "preview_urls",
        ])
      : [];

    const jobByShortId = new Map(jobs.map((job) => [job.short_id, job]));

    const settlements: ISettlementByJobRow[] = rows.map((row) => {
      const job = jobByShortId.get(row.job_short_id as string);

      return {
        job_short_id: (row.job_short_id as string) ?? null,
        product_name: job?.product_name,
        preview_urls: job?.preview_urls,
        settled_amount: toNumber(row.settled_amount),
        pending_amount: toNumber(row.pending_amount),
        reversed_amount: toNumber(row.reversed_amount),
        conversion_count: toNumber(row.conversion_count),
        creator_count: toNumber(row.creator_count),
      };
    });

    // Most owed first — the brand's next action is settling the biggest debt.
    settlements.sort((a, b) => b.pending_amount - a.pending_amount);

    return { settlements, summary: this.buildSummary(settlements) };
  };

  /**
   * Settled vs pending per creator, across all of the brand's jobs.
   */
  public getSettlementByCreator = async (brand: IUser) => {
    const rows = await this.earningDao.getSettlementByCreator(
      String(brand._id),
    );

    const userIds = rows.map((row) => row.user_id as string).filter(Boolean);

    const creators = userIds.length
      ? await this.userDao.getUserByUserIds(userIds, [
          "_id",
          "first_name",
          "last_name",
          "email",
          "user_profile_picture",
        ])
      : [];

    const creatorById = new Map(
      creators.map((creator) => [String(creator._id), creator]),
    );

    const settlements: ISettlementByCreatorRow[] = rows.map((row) => {
      const creator = creatorById.get(row.user_id as string);
      const name = [creator?.first_name, creator?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

      return {
        user_id: (row.user_id as string) ?? null,
        creator_name: name || undefined,
        creator_profile_picture: creator?.user_profile_picture,
        settled_amount: toNumber(row.settled_amount),
        pending_amount: toNumber(row.pending_amount),
        reversed_amount: toNumber(row.reversed_amount),
        conversion_count: toNumber(row.conversion_count),
        job_count: toNumber(row.job_count),
      };
    });

    settlements.sort((a, b) => b.pending_amount - a.pending_amount);

    return { settlements, summary: this.buildSummary(settlements) };
  };
}

export default SettlementService;
