// Modules
import {
  CredentialResponse,
  GoogleLogin,
  GoogleOAuthProvider,
} from "@react-oauth/google";
import { Github } from "lucide-react";
// Atoms
import { Button } from "@/atoms/ui/button";
import { Separator } from "@/atoms/ui/separator";
import { GoogleIcon } from "@/atoms/icons";
// Utils
import { cn } from "@/lib/utils";
// Typings
import { IOAuthClientDetails } from "@/typings/auth";

type TOAuthProvidersProps = {
  clientDetails?: IOAuthClientDetails;
  label?: string;
  disabled?: boolean;
  onGoogleSuccess: (payload: CredentialResponse) => void;
  onGoogleError?: () => void;
  onGithubClick: () => void;
};

/**
 * The third party sign-in block shared by Login and Signup.
 *
 * Each provider renders only when the backend actually advertises it through
 * GET /oauth/client-details, so an unconfigured provider degrades to hidden
 * rather than to a dead button.
 */
const OAuthProviders = ({
  clientDetails,
  label = "or continue with",
  disabled,
  onGoogleSuccess,
  onGoogleError,
  onGithubClick,
}: TOAuthProvidersProps) => {
  const hasGoogle = !!clientDetails?.google_client_id;
  const hasGithub = !!clientDetails?.github_init_url;

  if (!hasGoogle && !hasGithub) {
    return null;
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-muted-foreground shrink-0 text-xs">{label}</span>
        <Separator className="flex-1" />
      </div>

      <div className="grid gap-2">
        {hasGoogle && (
          <div className="relative w-full overflow-hidden rounded-md">
            {/*
              Google's real button always renders its own font/icon/height
              inside a cross-origin iframe, so it can never be pixel-matched to
              the GitHub button below by CSS alone. Instead we show our own
              identically-styled button and glue Google's real button on top,
              fully transparent — the click that lands is a genuine, trusted
              click on Google's own element, so its auth flow still works.
            */}
            <Button
              type="button"
              variant="outline"
              className="pointer-events-none w-full"
              tabIndex={-1}
              aria-hidden="true"
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            <div
              className={cn(
                "absolute inset-0 z-10 opacity-0 [&>div]:h-full [&>div]:w-full [&_iframe]:h-full [&_iframe]:w-full",
                disabled && "pointer-events-none"
              )}
            >
              <GoogleOAuthProvider clientId={clientDetails!.google_client_id!}>
                <GoogleLogin
                  type="standard"
                  theme="outline"
                  shape="rectangular"
                  width="400"
                  onSuccess={onGoogleSuccess}
                  onError={onGoogleError}
                />
              </GoogleOAuthProvider>
            </div>
          </div>
        )}

        {hasGithub && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={disabled}
            onClick={onGithubClick}
          >
            <Github />
            Continue with GitHub
          </Button>
        )}

        {/*
          Rendered only when Google is unavailable but GitHub is, to keep the
          brand icon set importable and the fallback visually balanced.
        */}
        {!hasGoogle && (
          <p className="text-muted-foreground flex items-center justify-center gap-1 text-[11px]">
            <GoogleIcon className="opacity-40" />
            Google sign-in is not configured
          </p>
        )}
      </div>
    </div>
  );
};

export default OAuthProviders;
