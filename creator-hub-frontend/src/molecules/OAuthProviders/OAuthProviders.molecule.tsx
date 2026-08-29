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
  // Google itself) baked into the button it renders *inside* the
  // cross-origin iframe — CSS can stretch the iframe element itself to
  // fill any container, but the clickable button drawn inside Google's own
  // document stays exactly `width` px wide regardless. A hardcoded "400"
  // only happens to cover the whole decoy button when the container is
  // narrower than that (mobile); on a wider desktop card, clicks past that
  // 400px boundary land on empty iframe space and do nothing.
  //
  // Fix: measure the actual available width, clamp it to Google's own
  // 400px max, and size *both* the decoy button and the real overlaid one
  // to that same (possibly narrower-than-container) box, centered — so
  // they're always pixel-identical, never asking Google for more than it
  // supports.
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
          <div ref={containerRef} className="w-full">
            <div
              className="relative mx-auto overflow-hidden rounded-md"
              style={googleButtonWidth ? { width: googleButtonWidth } : undefined}
            >
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

              {/*
                Google renders a few nested wrapper divs (including an empty
                spacer sibling) plus the real iframe, each sized by its own
                font-metrics/zoom-dependent measurement rather than by us —
                stretching them via normal block-flow sizing just makes the
                spacer and the iframe stack on top of each other instead of
                overlapping. Pinning every level to `absolute inset-0` instead
                makes each one — however many Google injects — overlay its
                parent exactly, so the real clickable iframe always ends up
                covering precisely the same box as the visible decoy button.
              */}
              <div
                className={cn(
                  "absolute inset-0 z-10 opacity-0 [&_div]:!absolute [&_div]:!inset-0 [&_div]:!m-0 [&_div]:!h-full [&_div]:!w-full [&_iframe]:!absolute [&_iframe]:!inset-0 [&_iframe]:!m-0 [&_iframe]:!h-full [&_iframe]:!w-full",
                  disabled && "pointer-events-none"
                )}
              >
                {googleButtonWidth > 0 && (
                  <GoogleOAuthProvider clientId={clientDetails!.google_client_id!}>
                    <GoogleLogin
                      type="standard"
                      theme="outline"
                      shape="rectangular"
                      width={String(googleButtonWidth)}
                      onSuccess={onGoogleSuccess}
                      onError={onGoogleError}
                    />
                  </GoogleOAuthProvider>
                )}
              </div>
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
