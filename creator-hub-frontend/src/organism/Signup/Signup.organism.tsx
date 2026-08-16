// Modules
import React from "react";
import { Link } from "react-router-dom";
// Molecules
import { AuthCard } from "@/molecules/AuthCard";
import { OAuthProviders } from "@/molecules/OAuthProviders";
import { UserTypeToggle } from "@/molecules/UserTypeToggle";
// Hooks
import useOAuthLogin from "@/hooks/useOAuthLogin";
// Constants
import { ROUTE_PATHS } from "@/constants/common.constant";
// Typings
import { TUserType } from "@/typings/auth";

/**
 * Signup is OAuth-only: the backend has no email/password (or email+OTP)
 * account creation path, only Google and GitHub can create a new account.
 * The Creator/Brand choice below only takes effect the moment that new
 * account gets created.
 */
const Signup = () => {
  const [userType, setUserType] = React.useState<TUserType>("user");

  const {
    clientDetails,
    error,
    loading,
    handleGoogleSuccess,
    handleGoogleError,
    handleGithubLogin,
  } = useOAuthLogin(userType);

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
      <div className="grid gap-6">
        <UserTypeToggle
          value={userType}
          onChange={setUserType}
          disabled={loading}
        />

        <OAuthProviders
          clientDetails={clientDetails}
          label="continue with"
          disabled={loading}
          onGoogleSuccess={handleGoogleSuccess}
          onGoogleError={handleGoogleError}
          onGithubClick={handleGithubLogin}
        />
      </div>
    </AuthCard>
  );
};

export default Signup;
