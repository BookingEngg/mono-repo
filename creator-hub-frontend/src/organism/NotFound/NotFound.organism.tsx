// Modules
import { Link, useNavigate } from "react-router-dom";
// Atoms
import { Button } from "@/atoms/ui/button";
import { NotFoundIllustration } from "@/atoms/illustrations";
// Store
import { isUserAuthorized } from "@/store/auth";
import { useAppSelector } from "@/store/hooks";
// Constants
import { ROUTE_PATHS } from "@/constants/common.constant";
// Icons
import { ArrowLeftIcon } from "lucide-react";

/**
 * Catch-all for any path that doesn't match a registered route. Rendered
 * outside AuthLayout so it can own the full viewport for the illustration
 * instead of nesting inside AuthLayout's own header/footer chrome.
 */
const NotFound = () => {
  const isAuthorized = useAppSelector(isUserAuthorized);
  const navigate = useNavigate();
  const homePath = isAuthorized ? ROUTE_PATHS.HOME : ROUTE_PATHS.LOGIN;

  return (
    <div className="bg-muted flex min-h-svh flex-col p-6">
      <Link to={homePath} className="flex items-center gap-2 self-start font-semibold">
        <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md text-sm">
          CH
        </span>
        Creator Hub
      </Link>

      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <NotFoundIllustration className="text-foreground h-auto w-full max-w-2xl" />

        <div className="grid max-w-md gap-4 text-center">
          <div className="grid gap-2">
            <h1 className="text-2xl font-semibold">Page not found</h1>
            <p className="text-muted-foreground text-sm">
              The page you're looking for doesn't exist or may have moved.
            </p>
          </div>

          <div className="grid gap-2">
            <Button className="w-full" render={<Link to={homePath} />}>
              {isAuthorized ? "Back to Creator Hub" : "Back to sign in"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftIcon />
              Go back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
