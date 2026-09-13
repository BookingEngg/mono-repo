// Modules
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// Atoms
import { Alert, AlertDescription, AlertTitle } from "@/atoms/ui/alert";
import { Card, CardContent } from "@/atoms/ui/card";
// Services
import { getCreatorEarnings } from "@/services/CreatorHub.service";
// Constants
import { getJobDetailsPath } from "@/constants/common.constant";
// Typings
import { ICreatorJobEarning } from "@/typings/creatorHub";
// Utils
import { getErrorMessage } from "@/utils/util";
import { getPreviewImage } from "@/utils/job.util";
// Icons
import { IndianRupeeIcon, Loader2Icon, PackageIcon } from "lucide-react";

const formatLastEarned = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return `Last earned ${date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
};

/**
 * One job's earnings. Links through to the job so a creator can re-read what
 * they're being paid for.
 */
const JobEarningRow = ({ job }: { job: ICreatorJobEarning }) => {
  const previewImage = getPreviewImage(job.preview_urls);
  // A job the brand has since removed still has earnings against it, so the
  // row survives with a fallback name rather than disappearing.
  const title = job.product_name || "Job no longer listed";
  const lastEarned = formatLastEarned(job.last_earned_at);

  return (
    <Link
      to={getJobDetailsPath(job.job_short_id)}
      className="border-border bg-background flex items-center gap-3 rounded-xl border p-3 transition-shadow hover:shadow-md sm:p-4"
    >
      <div className="bg-muted text-muted-foreground flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg">
        {previewImage ? (
          <img
            src={previewImage.url}
            alt={title}
            className="size-full object-cover"
          />
        ) : (
          <PackageIcon className="size-5" />
        )}
      </div>

      <div className="grid min-w-0 flex-1 gap-0.5">
        <p className="line-clamp-1 text-sm font-semibold sm:text-base">
          {title}
        </p>
        {job.brand_name && (
          <p className="text-muted-foreground line-clamp-1 text-xs sm:text-sm">
            {job.brand_name}
          </p>
        )}
        <p className="text-muted-foreground text-xs">
          {job.conversion_count} conversion
          {job.conversion_count === 1 ? "" : "s"}
          {lastEarned && ` · ${lastEarned}`}
        </p>
      </div>

      <div className="grid shrink-0 gap-0.5 text-right">
        <p className="text-base font-semibold sm:text-lg">
          {job.total_display}
        </p>
        {/*
          Pending is only worth its own line when there is some — a job whose
          earnings are fully settled doesn't need the breakdown repeated.
        */}
        {job.pending_amount > 0 && (
          <p className="text-muted-foreground text-xs">
            {job.pending_display} pending
          </p>
        )}
      </div>
    </Link>
  );
};

/**
 * Creator-facing earnings view: what they've earned in total, what is still
 * owed, and where each rupee came from.
 *
 * Grouped by job rather than by conversion — a creator wants to know which
 * work is paying, not to read a transaction log.
 */
const Earnings = () => {
  const { data, isPending, error } = useQuery({
    queryKey: ["creator-earnings"],
    queryFn: getCreatorEarnings,
  });

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold sm:text-2xl">Earnings</h1>
        <p className="text-muted-foreground text-sm">
          What you've earned across every job, and what's still to come.
        </p>
      </div>

      {isPending ? (
        <div className="text-muted-foreground flex items-center justify-center py-12">
          <Loader2Icon className="animate-spin" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>We couldn't load your earnings.</AlertTitle>
          <AlertDescription>
            {getErrorMessage(error, "Please try again in a moment.")}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/*
            Two figures answering two different questions: money that has
            actually reached the creator, and money a brand still owes them.
            Deliberately not the lifetime total in the headline — "earned" and
            "received" are not the same thing, and leading with the larger
            number would overstate what they can actually count on.

            The lifetime figure stays in the subtitle, where it gives the two
            cards context without competing with them.
          */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Card size="sm">
              <CardContent className="grid gap-1">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Account earning
                </p>
                {/* Green: this is money in hand, the good news on the page. */}
                <p className="text-2xl font-semibold text-emerald-600">
                  {data.paid_display}
                </p>
                <p className="text-muted-foreground text-xs">
                  Settled to you · {data.total_display} earned in total
                </p>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardContent className="grid gap-1">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Pending earning
                </p>
                <p className="text-2xl font-semibold">{data.pending_display}</p>
                <p className="text-muted-foreground text-xs">
                  Awaiting settlement by the brand · {data.conversion_count}{" "}
                  conversion{data.conversion_count === 1 ? "" : "s"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-base font-semibold">Earnings by job</h2>

            {data.jobs.length ? (
              <div className="grid gap-3">
                {data.jobs.map((job) => (
                  <JobEarningRow key={job.job_short_id} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center text-sm">
                <IndianRupeeIcon className="size-8" />
                You haven't earned anything yet. Share a job link to start
                earning.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Earnings;
