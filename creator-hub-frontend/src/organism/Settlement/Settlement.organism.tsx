// Modules
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
import { getSettlementByCreator } from "@/services/Settlement.service";
// Utils
import { cn } from "@/lib/utils";
import { formatCurrency, getErrorMessage, getInitials } from "@/utils/util";
// Constants
import { getSettlementCheckoutPath } from "@/constants/common.constant";
// Typings
import { ISettlementSummary } from "@/typings/settlement";
// Icons
import { Loader2Icon } from "lucide-react";

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
 * Brand-facing settlement view: what each creator is owed, across every job.
 *
 * Grouped by creator rather than by job because a brand pays a person, not a
 * campaign — a creator who earned on three jobs should be one payout, not
 * three separate gateway trips.
 */
const Settlement = () => {
  const { data, isPending, error } = useQuery({
    queryKey: ["settlement", "creator"],
    queryFn: getSettlementByCreator,
  });

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold sm:text-2xl">Settlement</h1>
        <p className="text-muted-foreground text-sm">
          What you've paid creators and what's still owed.
        </p>
      </div>

      {data?.summary && <SummaryCards summary={data.summary} />}

      {isPending && (
        <div className="text-muted-foreground flex justify-center py-10">
          <Loader2Icon className="animate-spin" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>
            {getErrorMessage(error, "We could not load settlements.")}
          </AlertTitle>
        </Alert>
      )}

      {data && data.settlements.length === 0 && (
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
        {data?.settlements.map((row) => (
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

              <div className="border-border flex items-end justify-between gap-3 border-t pt-3">
                <div className="flex gap-5 sm:gap-8">
                  <div className="grid gap-0.5">
                    <p className="text-muted-foreground text-[11px]">Pending</p>
                    <p
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        row.pending_amount > 0
                          ? "text-amber-600"
                          : "text-muted-foreground",
                      )}
                    >
                      {formatCurrency(row.pending_amount)}
                    </p>
                  </div>
                  <div className="grid gap-0.5">
                    <p className="text-muted-foreground text-[11px]">Settled</p>
                    <p className="text-sm font-semibold tabular-nums">
                      {formatCurrency(row.settled_amount)}
                    </p>
                  </div>
                </div>

                {/* Nothing owed means no action — a "Settle ₹0" button would
                    be a dead control. */}
                {row.pending_amount > 0 && row.user_id && (
                  <Button
                    size="sm"
                    className="shrink-0"
                    render={
                      <Link
                        to={getSettlementCheckoutPath("creator", row.user_id)}
                      />
                    }
                  >
                    Settle
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Settlement;
