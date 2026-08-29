// Modules
import React from "react";
import { Link } from "react-router-dom";
// Atoms
import { Button } from "@/atoms/ui/button";
// Molecules
import { AuthCard } from "@/molecules/AuthCard";
import { FormField } from "@/molecules/FormField";
import { OtpField } from "@/molecules/OtpField";
import { OAuthProviders } from "@/molecules/OAuthProviders";
// Services
import { sendOtp, verifyOtp } from "@/services/Auth.service";
// Hooks
import useOAuthLogin from "@/hooks/useOAuthLogin";
// Constants
import { OTP_LENGTH, ROUTE_PATHS } from "@/constants/common.constant";
// Utils
import { getErrorMessage, isValidEmail } from "@/utils/util";
// Icons
import { ArrowLeftIcon, Loader2Icon } from "lucide-react";

const defaultPayloadValue = {
  email: "",
  otp: "",
};

/**
 * Brand's own return login — email+OTP, plus OAuth as an alternative for a
 * brand whose email happens to match a Google/GitHub account. isSignup
 * stays false here (the default): OAuth only ever logs an *existing* brand
 * in on this page — a brand-new account still only gets created via the
 * plain form at /brand/signup, never through this path.
 */
const BrandLogin = () => {
  const {
    clientDetails,
    error,
    loading,
    setError,
    setLoading,
    syncAuthUser,
    handleGoogleSuccess,
    handleGoogleError,
    handleGithubLogin,
  } = useOAuthLogin("brand");

  const [payload, setPayload] = React.useState(defaultPayloadValue);
  const [isVerifyOtpVisible, setIsVerifyOtpVisible] = React.useState(false);
  const [fieldError, setFieldError] = React.useState("");

  const handlePayloadChange = React.useCallback(
    (value: string, key: string) => {
      setFieldError("");
      setPayload((previous) => ({ ...previous, [key]: value }));
    },
    [],
  );

  const handleOtpSend = React.useCallback(async () => {
    if (!isValidEmail(payload.email)) {
      setFieldError("Enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await sendOtp({ email: payload.email });
      setIsVerifyOtpVisible(true);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "We could not send the code."));
    } finally {
      setLoading(false);
    }
  }, [payload.email, setError, setLoading]);

  const handleOtpVerify = React.useCallback(
    async (otp: string = payload.otp) => {
      if (otp.length !== OTP_LENGTH) {
        setFieldError(`Enter the ${OTP_LENGTH} digit code`);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const otpResponse = await verifyOtp({ email: payload.email, otp });
        if (!otpResponse?.status) {
          setFieldError("That code is invalid or has expired.");
          return;
        }

        const isSynced = await syncAuthUser();
        if (!isSynced) {
          setError("Verified, but the session could not be read.");
        }
      } catch (caughtError) {
        setFieldError(getErrorMessage(caughtError, "That code is invalid."));
      } finally {
        setLoading(false);
      }
    },
    [payload, setError, setLoading, syncAuthUser],
  );

  const handleBackToEmail = React.useCallback(() => {
    setIsVerifyOtpVisible(false);
    setFieldError("");
    setError("");
    setPayload((previous) => ({ ...previous, otp: "" }));
  }, [setError]);

  return (
    <AuthCard
      title="Brand sign in"
      description={
        isVerifyOtpVisible
          ? "Enter the code we emailed you to continue."
          : "Sign in to your brand account."
      }
      error={error}
      footer={
        !isVerifyOtpVisible && (
          <span className="text-muted-foreground">
            New brand?{" "}
            <Link
              to={ROUTE_PATHS.BRAND_SIGNUP}
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </span>
        )
      }
    >
      {isVerifyOtpVisible ? (
        <div className="grid gap-4">
          <OtpField
            value={payload.otp}
            email={payload.email}
            disabled={loading}
            error={fieldError}
            onChange={(value) => handlePayloadChange(value, "otp")}
            onComplete={handleOtpVerify}
            onResend={handleOtpSend}
          />

          <Button className="w-full" disabled={loading} onClick={() => handleOtpVerify()}>
            {loading && <Loader2Icon className="animate-spin" />}
            Verify and sign in
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            disabled={loading}
            onClick={handleBackToEmail}
          >
            <ArrowLeftIcon />
            Use a different email
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-4">
            <FormField
              id="email"
              label="Email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={payload.email}
              disabled={loading}
              error={fieldError}
              hint="We'll email you a one time code."
              onChange={(value) => handlePayloadChange(value, "email")}
              onEnter={handleOtpSend}
            />

            <Button className="w-full" disabled={loading} onClick={handleOtpSend}>
              {loading && <Loader2Icon className="animate-spin" />}
              Continue with email
            </Button>
          </div>

          <OAuthProviders
            clientDetails={clientDetails}
            disabled={loading}
            onGoogleSuccess={handleGoogleSuccess}
            onGoogleError={handleGoogleError}
            onGithubClick={handleGithubLogin}
          />
        </div>
      )}
    </AuthCard>
  );
};

export default BrandLogin;
