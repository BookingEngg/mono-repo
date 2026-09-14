// Modules
import React from "react";
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

  // Google's `width` prop is a fixed pixel value (200-400, hard capped by
  // Google itself) baked into the button it renders inside its cross-origin
  // iframe, so it can't be styled with `w-full` — we measure the available
  // space and clamp to Google's own 400px max instead.
  const [containerWidth, setContainerWidth] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const node = containerRef.current;
    if (!node || !hasGoogle) {
      return;
    }

    const updateWidth = () => setContainerWidth(node.offsetWidth);
    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(node);
    return () => resizeObserver.disconnect();
  }, [hasGoogle]);

  const googleButtonWidth = Math.min(containerWidth, 400);

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
          <div
            ref={containerRef}
            className={cn("w-full", disabled && "pointer-events-none opacity-50")}
          >
            {googleButtonWidth > 0 && (
              <div className="mx-auto" style={{ width: googleButtonWidth }}>
                <GoogleOAuthProvider clientId={clientDetails!.google_client_id!}>
                  <GoogleLogin
                    type="standard"
                    theme="outline"
                    shape="rectangular"
                    size="medium"
                    text="continue_with"
                    logo_alignment="center"
                    width={String(googleButtonWidth)}
                    onSuccess={onGoogleSuccess}
                    onError={onGoogleError}
                  />
                </GoogleOAuthProvider>
              </div>
            )}
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
