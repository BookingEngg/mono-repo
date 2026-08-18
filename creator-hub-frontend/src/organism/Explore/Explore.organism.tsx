// Modules
import React from "react";
import { Loader2Icon, PackageSearchIcon } from "lucide-react";
// Atoms
import { Button } from "@/atoms/ui/button";
// Molecules
import { JobCard } from "@/molecules/JobCard";
// Hooks
import useAccess from "@/hooks/useAccess";
// Services
import {
  listBrandJobs,
  listInfluencerJobs,
} from "@/services/CreatorHub.service";
// Constants
import { ROLES } from "@/constants/access.constant";
import { getJobCheckoutPath } from "@/constants/common.constant";
// Typings
import { IJobListItem } from "@/typings/creatorHub";
// Utils
import { getErrorMessage } from "@/utils/util";

const PAGE_SIZE = 10;

/**
 * Two distinct endpoints, one per role: a brand only ever sees its own
 * jobs (GET /creator/job/brand), an influencer sees every active job across
 * brands (GET /creator/job).
 */
const Explore = () => {
  const { hasRole } = useAccess();
  const isBrand = hasRole(ROLES.BRAND);
  const fetchJobs = isBrand ? listBrandJobs : listInfluencerJobs;

  const [jobs, setJobs] = React.useState<IJobListItem[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let isActive = true;

    const loadFirstPage = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetchJobs({ page: 1, limit: PAGE_SIZE });
        if (!isActive) return;
        setJobs(response.jobs);
        setPage(response.pagination.page);
        setTotalPages(response.pagination.total_pages);
      } catch (caughtError) {
        if (isActive) {
          setError(getErrorMessage(caughtError, "We could not load jobs."));
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadFirstPage();

    return () => {
      isActive = false;
    };
  }, [fetchJobs]);

  const handleLoadMore = React.useCallback(async () => {
    setLoadingMore(true);
    setError("");
    try {
      const response = await fetchJobs({ page: page + 1, limit: PAGE_SIZE });
      setJobs((previousJobs) => [...previousJobs, ...response.jobs]);
      setPage(response.pagination.page);
      setTotalPages(response.pagination.total_pages);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "We could not load more jobs."));
    } finally {
      setLoadingMore(false);
    }
  }, [fetchJobs, page]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        {/* MobileHeader already shows this tab's name below md */}
        <h1 className="hidden text-2xl font-semibold md:block">
          {isBrand ? "Your jobs" : "Explore Jobs"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isBrand
            ? "Jobs you've posted for creators to apply to."
            : "Discover brands and campaigns looking for creators like you."}
        </p>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {loading ? (
        <div className="text-muted-foreground flex items-center justify-center py-12">
          <Loader2Icon className="animate-spin" />
        </div>
      ) : jobs.length ? (
        <>
          {/* Full-width single column on mobile — grid-cols-2 there just left a job card half as wide as it needed to be */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {jobs.map((job) => (
              <JobCard
                key={job.short_id}
                job={job}
                applyHref={
                  !isBrand && job.short_id
                    ? getJobCheckoutPath(job.short_id)
                    : undefined
                }
              />
            ))}
          </div>

          {page < totalPages && (
            <Button
              variant="outline"
              className="mx-auto"
              disabled={loadingMore}
              onClick={handleLoadMore}
            >
              {loadingMore && <Loader2Icon className="animate-spin" />}
              Load more
            </Button>
          )}
        </>
      ) : (
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-12 text-center text-sm">
          <PackageSearchIcon className="size-8" />
          {isBrand
            ? "You haven't posted any jobs yet."
            : "No jobs available right now — check back soon."}
        </div>
      )}
    </div>
  );
};

export default Explore;
