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
 * Login calls this with no argument (defaults to "user"); Signup passes its
 * selected toggle value.
 */
const useOAuthLogin = (userType: TUserType = "user") => {
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
    [syncAuthUser, userType]
  );

  const handleGoogleError = React.useCallback(() => {
    setError("Google sign-in was cancelled or failed.");
  }, []);

  /**
   * GitHub is a full page redirect handled by the backend. user_type can't be
   * sent as a request body here, so it rides along as a query param that the
   * backend threads through GitHub's own `state` param and back.
   */
  const handleGithubLogin = React.useCallback(() => {
    if (!clientDetails?.github_init_url) {
      setError("GitHub sign-in is not configured yet.");
      return;
    }

    const url = new URL(clientDetails.github_init_url);
    url.searchParams.set("user_type", userType);
    window.open(url.toString(), "_self", "noreferrer");
  }, [clientDetails, userType]);

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
