// Modules
import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// Atoms
import { Avatar, AvatarFallback, AvatarImage } from "@/atoms/ui/avatar";
import { Button } from "@/atoms/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/atoms/ui/card";
import { Alert, AlertTitle } from "@/atoms/ui/alert";
// Services
import {
  getSettlementByCreator,
  getSettlementByJob,
} from "@/services/Settlement.service";
// Utils
import { cn } from "@/lib/utils";
import { formatCurrency, getErrorMessage, getInitials } from "@/utils/util";
import { getPreviewImage } from "@/utils/job.util";
// Constants
import { getSettlementCheckoutPath } from "@/constants/common.constant";
// Typings
import { ISettlementSummary } from "@/typings/settlement";
// Icons
import { Loader2Icon, PackageIcon } from "lucide-react";

type TView = "job" | "creator";

const VIEWS: { value: TView; label: string }[] = [
  { value: "job", label: "By job" },
  { value: "creator", label: "By creator" },
];

/**
 * The three headline figures. Kept on one row at every width — they're three
 * short numbers, and stacking them pushed the actual list below the fold on
 * mobile.
 */
const SummaryCards = ({ summary }: { summary: ISettlementSummary }) => (
  <div className="grid grid-cols-3 gap-2 sm:gap-3">
    {[
      { label: "Pending", value: summary.pending_amount, accent: true },
      { label: "Settled", value: summary.settled_amount, accent: false },
      { label: "Total", value: summary.total_amount, accent: false },
    ].map((tile) => (
      <Card key={tile.label} size="sm" className="gap-0">
        <CardContent className="grid gap-0.5">
          <p className="text-muted-foreground text-[11px] sm:text-xs">
            {tile.label}
          </p>
          <p
            className={cn(
              "truncate text-base font-semibold tabular-nums sm:text-xl",
              // Pending is the only number the brand has to act on.
              tile.accent && tile.value > 0 && "text-amber-600",
            )}
          >
            {formatCurrency(tile.value)}
          </p>
        </CardContent>
      </Card>
    ))}
  </div>
);

/**
 * The money row on a settlement card: amounts on the left, the settle action
 * on the right, separated from the identity block above it.
 *
 * The action only renders when something is owed — a "Settle ₹0" button would
 * be a dead control.
 */
const SettlementFooter = ({
  pending,
  settled,
  scope,
  reference,
}: {
  pending: number;
  settled: number;
  scope: TView;
  reference: string | null;
}) => (
  <div className="border-border flex items-end justify-between gap-3 border-t pt-3">
    <div className="flex gap-5 sm:gap-8">
      <div className="grid gap-0.5">
        <p className="text-muted-foreground text-[11px]">Pending</p>
        <p
          className={cn(
            "text-sm font-semibold tabular-nums",
            pending > 0 ? "text-amber-600" : "text-muted-foreground",
          )}
        >
          {formatCurrency(pending)}
        </p>
      </div>
      <div className="grid gap-0.5">
        <p className="text-muted-foreground text-[11px]">Settled</p>
        <p className="text-sm font-semibold tabular-nums">
          {formatCurrency(settled)}
        </p>
      </div>
    </div>

    {pending > 0 && reference && (
      <Button
        size="sm"
        className="shrink-0"
        render={<Link to={getSettlementCheckoutPath(scope, reference)} />}
      >
        Settle
      </Button>
    )}
  </div>
);

/**
 * Brand-facing settlement view. Two slices of the same earnings — grouped by
 * job, or by creator — so a brand can see both which campaign owes money and
 * who they owe it to. Totals agree between the two by construction.
 */
const Settlement = () => {
  const [view, setView] = React.useState<TView>("job");

  const jobQuery = useQuery({
    queryKey: ["settlement", "job"],
    queryFn: getSettlementByJob,
    enabled: view === "job",
  });

  const creatorQuery = useQuery({
    queryKey: ["settlement", "creator"],
    queryFn: getSettlementByCreator,
    enabled: view === "creator",
  });

  const active = view === "job" ? jobQuery : creatorQuery;
  const summary = active.data?.summary;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold sm:text-2xl">Settlement</h1>
        <p className="text-muted-foreground text-sm">
          What you've paid out and what's still owed.
        </p>
      </div>

      <div className="bg-muted grid w-full grid-cols-2 gap-1 rounded-lg p-1 sm:w-fit sm:grid-cols-none sm:grid-flow-col">
        {VIEWS.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-md",
              view === option.value
                ? "bg-background shadow-sm"
                : "text-muted-foreground",
            )}
            onClick={() => setView(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {summary && <SummaryCards summary={summary} />}

      {active.isPending && (
        <div className="text-muted-foreground flex justify-center py-10">
          <Loader2Icon className="animate-spin" />
        </div>
      )}

      {active.error && (
        <Alert variant="destructive">
          <AlertTitle>
            {getErrorMessage(active.error, "We could not load settlements.")}
          </AlertTitle>
        </Alert>
      )}

      {active.data && active.data.settlements.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nothing to settle yet</CardTitle>
            <CardDescription>
              Once creators start converting on your jobs, their earnings show
              up here.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-3">
        {view === "job" &&
          jobQuery.data?.settlements.map((row) => {
            const preview = getPreviewImage(row.preview_urls);

            return (
              <Card key={row.job_short_id ?? "unknown"} className="gap-0">
                <CardContent className="grid gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="bg-muted text-muted-foreground flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md">
                      {preview ? (
                        <img
                          src={preview.url}
                          alt={row.product_name ?? "Job"}
                          className="size-full object-cover"
                        />
                      ) : (
                        <PackageIcon className="size-5" />
                      )}
                    </div>
                    <div className="grid min-w-0 gap-0.5">
                      <p className="line-clamp-1 text-sm font-semibold">
                        {row.product_name ?? "Job"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {row.creator_count} creator
                        {row.creator_count === 1 ? "" : "s"} ·{" "}
                        {row.conversion_count} conversion
                        {row.conversion_count === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  <SettlementFooter
                    pending={row.pending_amount}
                    settled={row.settled_amount}
                    scope="job"
                    reference={row.job_short_id}
                  />
                </CardContent>
              </Card>
            );
          })}

        {view === "creator" &&
          creatorQuery.data?.settlements.map((row) => (
            <Card key={row.user_id ?? "unknown"} className="gap-0">
              <CardContent className="grid gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="size-11">
                    <AvatarImage
                      src={row.creator_profile_picture}
                      alt={row.creator_name ?? "Creator"}
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(
                        row.creator_name?.split(" ")[0],
                        row.creator_name?.split(" ")[1],
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid min-w-0 gap-0.5">
                    <p className="line-clamp-1 text-sm font-semibold">
                      {row.creator_name ?? "Creator"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {row.job_count} job{row.job_count === 1 ? "" : "s"} ·{" "}
                      {row.conversion_count} conversion
                      {row.conversion_count === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <SettlementFooter
                  pending={row.pending_amount}
                  settled={row.settled_amount}
                  scope="creator"
                  reference={row.user_id}
                />
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default Settlement;
