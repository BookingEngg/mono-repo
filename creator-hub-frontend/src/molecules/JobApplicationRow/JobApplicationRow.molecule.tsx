// Modules
import React from "react";
import { toast } from "sonner";
import { CheckIcon, CopyIcon, PackageIcon } from "lucide-react";
// Atoms
import { Button } from "@/atoms/ui/button";
// Typings
import { IJobApplicationListItem } from "@/typings/creatorHub";
// Utils
import { getJobApplicationLink, getPreviewImage } from "@/utils/job.util";

type TJobApplicationRowProps = {
  application: IJobApplicationListItem;
};

const getAppliedOnLabel = (createdAt?: string): string | undefined => {
  if (!createdAt) return undefined;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return undefined;

  return `Applied on ${date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
};

const JobApplicationRow = ({ application }: TJobApplicationRowProps) => {
  const [copied, setCopied] = React.useState(false);
  const previewImage = getPreviewImage(application.preview_urls);
  const title = application.product_name || "Affiliate job";
  const appliedOnLabel = getAppliedOnLabel(application.createdAt);

  const handleCopyLink = React.useCallback(async () => {
    if (!application.link_short_id) return;

    try {
      await navigator.clipboard.writeText(
        getJobApplicationLink(application.link_short_id)
      );
      setCopied(true);
      toast.success("Link copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("We could not copy the link.");
    }
  }, [application.link_short_id]);

  return (
    <div className="border-border bg-background flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <div className="flex min-w-0 items-center gap-3">
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
        <div className="grid min-w-0 gap-0.5">
          <p className="line-clamp-1 text-sm font-semibold sm:text-base">
            {title}
          </p>
          {application.brand_name && (
            <p className="text-muted-foreground line-clamp-1 text-xs sm:text-sm">
              {application.brand_name}
            </p>
          )}
          {appliedOnLabel && (
            <p className="text-muted-foreground text-[11px] sm:text-xs">
              {appliedOnLabel}
            </p>
          )}
        </div>
      </div>

      {application.link_short_id && (
        <Button
          variant="outline"
          size="sm"
          className="sm:shrink-0"
          onClick={handleCopyLink}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copied" : "Copy link"}
        </Button>
      )}
    </div>
  );
};

export default JobApplicationRow;
