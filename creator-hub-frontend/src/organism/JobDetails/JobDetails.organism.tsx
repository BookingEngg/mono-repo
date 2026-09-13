// Modules
import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// Atoms
import { Alert, AlertDescription, AlertTitle } from "@/atoms/ui/alert";
import { Button } from "@/atoms/ui/button";
import { Card, CardContent } from "@/atoms/ui/card";
import { Separator } from "@/atoms/ui/separator";
// Services
import { getJobDetails } from "@/services/CreatorHub.service";
// Constants
import { ROUTE_PATHS, getJobCheckoutPath } from "@/constants/common.constant";
// Utils
import { formatCurrency, getErrorMessage } from "@/utils/util";
import { getJobTitle } from "@/utils/job.util";
// Icons
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  Loader2Icon,
  PackageIcon,
  SparklesIcon,
} from "lucide-react";

/**
 * One job, in full — what a creator reads before deciding to apply.
 *
 * Everything shown comes from the API: the earning line is rendered as sent
 * rather than recomputed here, so this screen and the checkout summary can
 * never quote a creator different numbers for the same job.
 */
const JobDetails = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();

  const {
    data: job,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["job-details", shortId],
    queryFn: () => getJobDetails(shortId as string),
    enabled: !!shortId,
    retry: false,
  });

  // Videos first: a job's own clip is the thing worth leading with, and the
  // reference layout opens on one.
  const media = React.useMemo(() => {
    const all = job?.preview_urls ?? [];
    return [
      ...all.filter((item) => item.type === "video"),
      ...all.filter((item) => item.type !== "video"),
    ];
  }, [job?.preview_urls]);

  const [activeMedia, setActiveMedia] = React.useState(0);

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex items-center justify-center py-16">
        <Loader2Icon className="animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex w-full flex-col gap-4">
        <Button
          variant="ghost"
          className="self-start"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertTitle>We couldn't load this job.</AlertTitle>
          <AlertDescription>
            {getErrorMessage(error, "It may have been removed by the brand.")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const title = getJobTitle(job);
  const remaining = job.job_count.available - job.job_count.completed;
  const activeItem = media[activeMedia];

  // Each category level is its own tag — l1 through l4 read as a set of
  // labels ("women wear", "jewellery"), not one breadcrumb string.
  const categoryTags = [
    job.category?.l1,
    job.category?.l2,
    job.category?.l3,
    job.category?.l4,
  ].filter(Boolean) as string[];

  const detailRows: { label: string; value: string }[] = [
    {
      label: "Creator gender",
      // Absent means the brand didn't restrict it — stated plainly, since a
      // blank row reads as missing data rather than "open to everyone".
      value: job.gender
        ? job.gender.charAt(0).toUpperCase() + job.gender.slice(1)
        : "Any",
    },
    job.due_date !== undefined && {
      label: "Time to complete",
      value: `${job.due_date} day${job.due_date === 1 ? "" : "s"}`,
    },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    /*
      This route renders OUTSIDE MainLayout (see App.tsx) — a focused flow
      with its own header rather than the SideNav/BottomNav chrome — so the
      page owns its own width, centring and padding. Without them the content
      sat flush against the left edge of the viewport.

      max-w-5xl rather than Checkout's max-w-2xl: this is a two column layout,
      and 2xl squeezes the media and text columns together.

      pb-20 clears the fixed action bar (py-2 + a h-12 button = 64px). At md
      the bar is back in normal flow, so only the container's own padding is
      needed.
    */
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 pb-20 sm:p-6 md:pb-6">
      <Button
        variant="ghost"
        className="-ml-2 self-start"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftIcon />
        Back
      </Button>

      {/*
        Fixed-width media column rather than a 50/50 split: a square image
        across half a wide viewport renders enormous, pushing every detail
        below the fold. Capped here, so the text column takes the extra room
        as the window grows.
      */}
      <div className="grid gap-5 md:grid-cols-[400px_1fr] md:items-start md:gap-8">
        <div className="flex flex-col gap-3 md:sticky md:top-6">
          <div className="bg-muted flex aspect-square w-full items-center justify-center overflow-hidden">
            {activeItem?.type === "video" ? (
              /*
                Not autoplayed: a creator opening a job on mobile data
                shouldn't have a video start on its own.
              */
              <video
                src={activeItem.url}
                controls
                playsInline
                className="size-full object-cover"
              />
            ) : activeItem ? (
              <img
                src={activeItem.url}
                alt={title}
                className="size-full object-cover"
              />
            ) : (
              <PackageIcon className="text-muted-foreground size-10" />
            )}
          </div>

          {media.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {media.map((item, index) => (
                <button
                  key={`${item.url}-${index}`}
                  type="button"
                  aria-label={`Show ${item.type} ${index + 1}`}
                  aria-current={index === activeMedia}
                  onClick={() => setActiveMedia(index)}
                  className={`bg-muted size-14 overflow-hidden rounded-lg border-2 transition-colors ${
                    index === activeMedia
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  {item.type === "video" ? (
                    <video src={item.url} className="size-full object-cover" />
                  ) : (
                    <img
                      src={item.url}
                      alt=""
                      className="size-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/*
          Capped width: without it the detail rows justify to the full column
          and a label ends up a chasm away from its own value.
        */}
        <div className="flex min-w-0 flex-col gap-4 md:max-w-xl">
          <div className="flex flex-col gap-1">
            {job.brand_name && (
              <p className="text-primary text-xs font-medium tracking-wide uppercase">
                {job.brand_name}
              </p>
            )}
            <h1 className="text-xl font-semibold">{title}</h1>

            {job.selling_price !== undefined && (
              <p className="text-lg font-semibold">
                {formatCurrency(job.selling_price)}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {job.is_applied && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                <CheckCircle2Icon className="size-3.5" />
                Applied
              </span>
            )}
            {job.is_open ? (
              <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-medium">
                {remaining} of {job.job_count.available} slot
                {job.job_count.available === 1 ? "" : "s"} remaining
              </span>
            ) : (
              <span className="text-muted-foreground bg-muted rounded-full px-2.5 py-1 text-xs font-medium">
                No slots left
              </span>
            )}
          </div>

          {/*
            The earning line is the question a creator is actually asking, so
            it gets its own card rather than sitting in a list of details.
          */}
          {job.earning_display && (
            <Card size="sm">
              <CardContent className="grid gap-1">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Earning potential
                </p>
                {job.earning_amount !== undefined && (
                  <p className="text-2xl font-semibold">
                    {formatCurrency(job.earning_amount)}
                  </p>
                )}
                <p className="text-muted-foreground text-sm">
                  {job.earning_display}
                </p>
              </CardContent>
            </Card>
          )}

          {/*
            The terms a creator needs before applying, in one block. Each row
            is omitted when the job doesn't carry it, so an older job doesn't
            render a list of blanks.
          */}
          {(detailRows.length > 0 || categoryTags.length > 0) && (
            <div className="grid gap-2">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Job details
              </p>

              {/*
                Tags get their own row rather than a value column: there can be
                up to four, and right-aligning a wrapping set against a label
                leaves them ragged.
              */}
              {categoryTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {categoryTags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-medium capitalize"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <dl className="grid gap-2">
                {detailRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start justify-between gap-4 text-sm"
                  >
                    <dt className="text-muted-foreground">{row.label}</dt>
                    <dd className="text-right font-medium">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <Card size="sm" className="bg-muted/50">
            <CardContent className="flex gap-3">
              <SparklesIcon className="text-primary mt-0.5 size-4 shrink-0" />
              <div className="grid gap-0.5">
                <p className="text-sm font-medium">How you earn</p>
                {/*
                  Deliberately not "per order" — the exact terms are stated
                  just above in earning_display, which varies by earning model
                  (per order, per click). Repeating one model's wording here
                  would contradict the card above on a CPC job.
                */}
                <p className="text-muted-foreground text-sm">
                  Share it on your social channels. Your link tracks every
                  sale it drives, and you get paid for each one.
                </p>
              </div>
            </CardContent>
          </Card>

        {/*
          Sticky on mobile so the action stays reachable through a long
          description; on desktop it sits inline at the end of the text
          column, beside the details it acts on — placed after the grid it
          landed orphaned under the image, a column away from its own
          context.

          bottom-0, not above a nav: BottomNav is rendered by MainLayout, and
          this route sits outside it. There is nothing underneath to clear.

          It keeps a solid background but no top border: the border was the hard
          line cutting through the content behind it, while dropping the
          background too left page text visible either side of the button.
        */}
        <div className="bg-background fixed inset-x-0 bottom-0 z-10 px-4 py-3 md:static md:bg-transparent md:px-0 md:py-0">
          {job.is_applied ? (
            <Button
              size="lg"
              className="h-12 w-full text-base font-semibold shadow-lg md:w-auto md:px-8 md:shadow-none"
              render={<Link to={ROUTE_PATHS.MY_APPLICATIONS} />}
            >
              <ClipboardCheckIcon />
              View your application
            </Button>
          ) : (
            <Button
              size="lg"
              className="h-12 w-full text-base font-semibold shadow-lg md:w-auto md:px-8 md:shadow-none"
              disabled={!job.is_open}
              render={
                job.is_open && job.short_id ? (
                  <Link to={getJobCheckoutPath(job.short_id)} />
                ) : undefined
              }
            >
              {job.is_open ? "Apply for the job" : "No slots left"}
            </Button>
          )}
        </div>
        </div>
      </div>

      {job.product_description && (
        <>
          <Separator />
          <div className="flex flex-col gap-2">
            <h2 className="text-base font-semibold">Product description</h2>
            {/*
              whitespace-pre-line, because brands paste copy with real line
              breaks — collapsing it into one block makes it unreadable.
            */}
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
              {job.product_description}
            </p>
          </div>
        </>
      )}

    </div>
  );
};

export default JobDetails;
