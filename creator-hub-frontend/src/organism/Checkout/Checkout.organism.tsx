// Modules
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeftIcon, Loader2Icon, PackageIcon } from "lucide-react";
// Atoms
import { Button } from "@/atoms/ui/button";
import { Alert, AlertDescription } from "@/atoms/ui/alert";
// Store
import { getAuthUser } from "@/store/auth";
import { useAppSelector } from "@/store/hooks";
// Services
import {
  applyForJob,
  getJobCheckoutDetails,
} from "@/services/CreatorHub.service";
// Constants
import { ROUTE_PATHS } from "@/constants/common.constant";
// Typings
import { IJobCheckoutDetails } from "@/typings/creatorHub";
// Utils
import { getErrorMessage } from "@/utils/util";
import { getJobPreviewImage, getJobTitle } from "@/utils/job.util";

const EARNING_MODEL_LABEL: Record<string, string> = {
  PERCENTAGE: "of order value",
  FIXED_PER_ORDER: "per order",
  CPC: "per click",
};

const Checkout = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector(getAuthUser);
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ");

  const [job, setJob] = React.useState<IJobCheckoutDetails | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!shortId) return;
    let isActive = true;

    const loadJob = async () => {
      setLoading(true);
      setError("");
      try {
        const details = await getJobCheckoutDetails(shortId);
        if (isActive) setJob(details);
      } catch (caughtError) {
        if (isActive) {
          setError(
            getErrorMessage(caughtError, "This job is no longer available.")
          );
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadJob();

    return () => {
      isActive = false;
    };
  }, [shortId]);

  const handleApply = React.useCallback(async () => {
    if (!shortId) return;

    setSubmitting(true);
    setError("");
    try {
      await applyForJob(shortId);
      toast.success("Application submitted.");
      navigate(ROUTE_PATHS.EXPLORE);
    } catch (caughtError) {
      setError(
        getErrorMessage(caughtError, "We could not submit your application.")
      );
    } finally {
      setSubmitting(false);
    }
  }, [shortId, navigate]);

  const previewImage = job ? getJobPreviewImage(job) : undefined;
  const isProductSourcing = job?.job_type === "product_sourcing";

  return (
    <div className="bg-background min-h-svh">
      <header className="border-border bg-background sticky top-0 z-10 flex items-center gap-3 border-b px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="bg-muted flex size-9 items-center justify-center rounded-full"
        >
          <ArrowLeftIcon className="size-4" />
        </button>
        <h1 className="text-lg font-semibold">Application Summary</h1>
      </header>

      <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4 sm:p-6">
        {loading ? (
          <div className="text-muted-foreground flex items-center justify-center py-16">
            <Loader2Icon className="animate-spin" />
          </div>
        ) : !job ? (
          <Alert variant="destructive">
            <AlertDescription>
              {error || "This job is no longer available."}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <section className="border-border grid gap-4 rounded-2xl border p-4 sm:p-5">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Order summary
              </p>

              <div className="flex gap-4">
                <div className="bg-muted size-24 shrink-0 overflow-hidden rounded-lg">
                  {previewImage ? (
                    <img
                      src={previewImage.url}
                      alt={getJobTitle(job)}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground flex size-full items-center justify-center">
                      <PackageIcon className="size-8" />
                    </div>
                  )}
                </div>

                <div className="grid gap-1">
                  {job.brand_name && (
                    <p className="text-primary text-xs font-semibold uppercase">
                      {job.brand_name}
                    </p>
                  )}
                  <p className="font-semibold">{getJobTitle(job)}</p>
                  {job.earning_model && (
                    <p className="text-muted-foreground text-sm">
                      Earn ₹{job.earning_model.value}{" "}
                      {EARNING_MODEL_LABEL[job.earning_model.type] ?? ""}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Shipping only applies to physical product jobs — affiliate jobs get a tracking link instead */}
            {isProductSourcing && (
              <section className="border-border grid gap-2 rounded-2xl border p-4 sm:p-5">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Shipping to
                </p>
                <p className="font-medium">{fullName || "Your account"}</p>
                {user?.email && (
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                )}
                <p className="text-muted-foreground text-xs">
                  We'll reach out over email to confirm your shipping address
                  once your application is accepted.
                </p>
              </section>
            )}

            <section className="border-border grid gap-1 rounded-2xl border p-4 sm:p-5">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Seller info
              </p>
              <p className="font-medium">{job.brand_name || "Brand"}</p>
              {!isProductSourcing && (
                <p className="text-muted-foreground text-xs">
                  You'll get a personal tracking link to share once you apply.
                </p>
              )}
            </section>

            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(event) => setAgreedToTerms(event.target.checked)}
                className="mt-0.5"
              />
              I agree to the Creator Hub terms and conditions
            </label>

            <Button
              className="w-full"
              disabled={!agreedToTerms || submitting}
              onClick={handleApply}
            >
              {submitting && <Loader2Icon className="animate-spin" />}
              Apply for job
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;
