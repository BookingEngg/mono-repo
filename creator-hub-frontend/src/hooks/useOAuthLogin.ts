// Modules
import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CredentialResponse } from "@react-oauth/google";
// Services
import {
  getOAuthClientDetails,
  getUser,
  getUserByGoogleOAuth,
} from "@/services/Auth.service";
// Store
import { login } from "@/store/auth";
import { useAppDispatch } from "@/store/hooks";
// Constants
import { ROUTE_PATHS } from "@/constants/common.constant";
// Typings
import { TUserType } from "@/typings/auth";
// Utils
import { getErrorMessage } from "@/utils/util";

/**
 * Owns everything shared by the Login and Signup organisms: fetching the
 * configured providers, exchanging a Google credential for a session, and
 * handing off to GitHub's redirect flow.
 *
 * `userType` only matters the moment a brand-new account gets created — an
 * existing creator's account type never changes just by logging in again.
 *
 * `isSignup` is what actually gates account creation: the backend only
 * creates a new profile when it's true. Login calls this with the default
 * (false) — if no account exists for that email, the backend errors rather
 * than silently signing someone up. Signup passes true.
 */
const useOAuthLogin = (userType: TUserType = "influencer", isSignup = false) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const { data: clientDetails } = useQuery({
    queryKey: ["oauth-client-details"],
    queryFn: () => getOAuthClientDetails(),
  });

  /**
   * Reads the freshly set auth cookie, hydrates the store and lands the creator
   * on the hub. Shared by the OTP and OAuth paths.
   */
  const syncAuthUser = React.useCallback(async () => {
    const response = await getUser();
    if (!response?.status) {
      return false;
    }

    dispatch(login({ user: response.user, isAuthorized: true }));
    navigate(ROUTE_PATHS.HOME);
    return true;
  }, [dispatch, navigate]);

  const handleGoogleSuccess = React.useCallback(
    async (payload: CredentialResponse) => {
      if (!payload.credential) {
        setError("Google did not return a credential. Please try again.");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const response = await getUserByGoogleOAuth({
          token: payload.credential,
          user_type: userType,
          is_signup: isSignup,
        });

        if (!response?.is_verified_user) {
          setError("We could not verify this Google account.");
          return;
        }

        const isSynced = await syncAuthUser();
        if (!isSynced) {
          setError("Signed in with Google, but the session could not be read.");
        }
      } catch (caughtError) {
        setError(getErrorMessage(caughtError, "Google sign-in failed."));
      } finally {
        setLoading(false);
      }
    },
    [isSignup, syncAuthUser, userType]
  );

  const handleGoogleError = React.useCallback(() => {
    setError("Google sign-in was cancelled or failed.");
  }, []);

  /**
   * GitHub is a full page redirect handled by the backend. Neither
   * user_type nor is_signup can be sent as a request body here, so they
   * ride along as query params to our own /github_init, which the backend
   * then packs into GitHub's `state` param so they survive the round trip.
   */
  const handleGithubLogin = React.useCallback(() => {
    if (!clientDetails?.github_init_url) {
      setError("GitHub sign-in is not configured yet.");
      return;
    }

    const url = new URL(clientDetails.github_init_url);
    url.searchParams.set("user_type", userType);
    url.searchParams.set("is_signup", String(isSignup));
    window.open(url.toString(), "_self", "noreferrer");
  }, [clientDetails, isSignup, userType]);

  return {
    clientDetails,
    error,
    loading,
    setError,
    setLoading,
    syncAuthUser,
    handleGoogleSuccess,
    handleGoogleError,
    handleGithubLogin,
  };
};

export default useOAuthLogin;
