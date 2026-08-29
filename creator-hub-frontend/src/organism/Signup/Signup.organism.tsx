// Modules
import { Link } from "react-router-dom";
// Molecules
import { AuthCard } from "@/molecules/AuthCard";
import { OAuthProviders } from "@/molecules/OAuthProviders";
// Hooks
import useOAuthLogin from "@/hooks/useOAuthLogin";
// Constants
import { ROUTE_PATHS } from "@/constants/common.constant";

/**
 * Influencer signup — same OAuth providers LOGIN uses, but this is the only
 * place that passes isSignup=true, which is what actually lets the backend
 * create a brand-new account (LOGIN's OAuth buttons will error instead of
 * silently signing someone up). Brands sign up separately at /brand/signup
 * (a plain form, no OAuth) — never linked from here.
 */
const Signup = () => {
  const {
    clientDetails,
    error,
    loading,
    handleGoogleSuccess,
    handleGoogleError,
    handleGithubLogin,
  } = useOAuthLogin("influencer", true);

  return (
    <AuthCard
      title="Create your account"
      description="Join Creator Hub and start collaborating."
      error={error}
      footer={
        <span className="text-muted-foreground">
          Already have an account?{" "}
          <Link
            to={ROUTE_PATHS.LOGIN}
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </span>
      }
    >
      <OAuthProviders
        clientDetails={clientDetails}
        label="continue with"
        disabled={loading}
        onGoogleSuccess={handleGoogleSuccess}
        onGoogleError={handleGoogleError}
        onGithubClick={handleGithubLogin}
      />
    </AuthCard>
  );
};

export default Signup;
