// Modules
import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
// Atoms
import { Button } from "@/atoms/ui/button";
// Molecules
import { AuthCard } from "@/molecules/AuthCard";
// Services
import { getUser } from "@/services/Auth.service";
// Store
import { login } from "@/store/auth";
import { useAppDispatch } from "@/store/hooks";
// Constants
import { ROUTE_PATHS } from "@/constants/common.constant";
// Utils
import { getErrorMessage } from "@/utils/util";
// Icons
import { Loader2Icon } from "lucide-react";

/**
 * Landing point for redirect based providers such as GitHub. The backend has
 * already set the auth cookie by the time we get here, so this screen only has
 * to read the session back and forward the creator on.
 */
const OAuthCallback = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [error, setError] = React.useState("");

  // The provider reports a denied consent screen back through the query string.
  const providerError = searchParams.get("error_description") || searchParams.get("error");

  React.useEffect(() => {
    if (providerError) {
      setError(providerError);
      return;
    }

    let isActive = true;

    const resolveSession = async () => {
      try {
        const response = await getUser();
        if (!isActive) {
          return;
        }

        if (!response?.status) {
          setError("We could not complete sign-in. Please try again.");
          return;
        }

        dispatch(login({ user: response.user, isAuthorized: true }));
        navigate(ROUTE_PATHS.HOME, { replace: true });
      } catch (caughtError) {
        if (isActive) {
          setError(getErrorMessage(caughtError, "Sign-in could not be completed."));
        }
      }
    };

    resolveSession();

    return () => {
      isActive = false;
    };
  }, [dispatch, navigate, providerError]);

  if (error) {
    return (
      <AuthCard
        title="Sign-in failed"
        description="We could not finish connecting your account."
        error={error}
      >
        {/* Base UI composes through `render` rather than Radix's `asChild` */}
        <Button className="w-full" render={<Link to={ROUTE_PATHS.LOGIN} />}>
          Back to sign in
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Signing you in"
      description="Hold tight while we finish connecting your account."
    >
      <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm">
        <Loader2Icon className="animate-spin" />
        Completing sign-in...
      </div>
    </AuthCard>
  );
};

export default OAuthCallback;
