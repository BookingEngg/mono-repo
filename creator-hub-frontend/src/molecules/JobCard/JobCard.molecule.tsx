// Modules
import { Link } from "react-router-dom";
import { PackageIcon } from "lucide-react";
// Atoms
import { Button } from "@/atoms/ui/button";
// Typings
import { IJobListItem } from "@/typings/creatorHub";
// Utils
import { getJobPreviewImage, getJobTitle } from "@/utils/job.util";

type TJobCardProps = {
  job: IJobListItem;
  applyHref?: string;
};

const JobCard = ({ job, applyHref }: TJobCardProps) => {
  const previewImage = getJobPreviewImage(job);
  const available = job.job_count?.available ?? 0;
  const completed = job.job_count?.completed ?? 0;
  const totalJobs = available + completed;
  const isLastJob = available === 1;
  const usedRatio = totalJobs > 0 ? completed / totalJobs : 0;

  return (
    <div className="border-border bg-background overflow-hidden rounded-2xl border">
      <div className="bg-muted relative aspect-4/5 w-full">
        {previewImage ? (
          <img
            src={previewImage.url}
            alt={getJobTitle(job)}
            className="size-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground flex size-full items-center justify-center">
            <PackageIcon className="size-10" />
          </div>
        )}

        {/* Brand's first name, pinned to the top-right of the preview image */}
        {job.brand_name && (
          <span className="bg-background/95 absolute top-2 right-2 rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm sm:top-3 sm:right-3 sm:px-3 sm:py-1.5 sm:text-xs">
            {job.brand_name.split(" ")[0]}
          </span>
        )}
      </div>

      <div className="grid gap-1 p-3 sm:p-4">
        <p className="line-clamp-2 text-sm font-semibold sm:text-base">
          {getJobTitle(job)}
        </p>
        {(job.brand_name || job.category?.l1) && (
          <p className="text-muted-foreground text-xs sm:text-sm">
            {[job.brand_name, job.category?.l1].filter(Boolean).join(" • ")}
          </p>
        )}
      </div>

      <div className="border-border grid gap-2 border-t px-3 py-2.5 sm:px-4 sm:py-3">
        <p
          className={`text-xs sm:text-sm ${isLastJob ? "text-destructive font-medium" : "text-muted-foreground"}`}
        >
          {isLastJob
            ? "Last Job Left!"
            : `${available}/${totalJobs} jobs remaining`}
        </p>
        <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full"
            style={{ width: `${Math.min(usedRatio * 100, 100)}%` }}
          />
        </div>

        {/* Only an influencer can apply — a brand viewing its own job gets no CTA */}
        {applyHref && (
          <Button
            className="mt-1 w-full uppercase"
            render={<Link to={applyHref} />}
          >
            Explore job
          </Button>
        )}
      </div>
    </div>
  );
};

export default JobCard;
