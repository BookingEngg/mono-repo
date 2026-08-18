// Modules
import React from "react";
import { Loader2Icon, ClipboardListIcon } from "lucide-react";
// Atoms
import { Button } from "@/atoms/ui/button";
// Molecules
import { JobApplicationRow } from "@/molecules/JobApplicationRow";
// Services
import { listJobApplications } from "@/services/CreatorHub.service";
// Typings
import { IJobApplicationListItem } from "@/typings/creatorHub";
// Utils
import { getErrorMessage } from "@/utils/util";

const PAGE_SIZE = 10;

/**
 * Influencer's own job applications (GET /creator/job-application), most
 * recent first. Mirrors Explore's load-first-page/load-more pattern.
 */
const Applications = () => {
  const [applications, setApplications] = React.useState<
    IJobApplicationListItem[]
  >([]);
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
        const response = await listJobApplications({
          page: 1,
          limit: PAGE_SIZE,
        });
        if (!isActive) return;
        setApplications(response.applications);
        setPage(response.pagination.page);
        setTotalPages(response.pagination.total_pages);
      } catch (caughtError) {
        if (isActive) {
          setError(
            getErrorMessage(caughtError, "We could not load your applications.")
          );
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadFirstPage();

    return () => {
      isActive = false;
    };
  }, []);

  const handleLoadMore = React.useCallback(async () => {
    setLoadingMore(true);
    setError("");
    try {
      const response = await listJobApplications({
        page: page + 1,
        limit: PAGE_SIZE,
      });
      setApplications((previousApplications) => [
        ...previousApplications,
        ...response.applications,
      ]);
      setPage(response.pagination.page);
      setTotalPages(response.pagination.total_pages);
    } catch (caughtError) {
      setError(
        getErrorMessage(caughtError, "We could not load more applications.")
      );
    } finally {
      setLoadingMore(false);
    }
  }, [page]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        {/* MobileHeader already shows this tab's name below md */}
        <h1 className="hidden text-2xl font-semibold md:block">
          Applications
        </h1>
        <p className="text-muted-foreground text-sm">
          Jobs you've applied to, and their affiliate links.
        </p>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {loading ? (
        <div className="text-muted-foreground flex items-center justify-center py-12">
          <Loader2Icon className="animate-spin" />
        </div>
      ) : applications.length ? (
        <>
          <div className="grid gap-3">
            {applications.map((application) => (
              <JobApplicationRow
                key={application.short_id}
                application={application}
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
          <ClipboardListIcon className="size-8" />
          You haven't applied to any jobs yet.
        </div>
      )}
    </div>
  );
};

export default Applications;
