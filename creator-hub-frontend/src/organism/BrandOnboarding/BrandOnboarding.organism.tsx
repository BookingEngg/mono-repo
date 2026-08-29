// Modules
import React from "react";
import { useNavigate } from "react-router-dom";
// Atoms
import { Button } from "@/atoms/ui/button";
// Molecules
import { AuthCard } from "@/molecules/AuthCard";
import { OtpField } from "@/molecules/OtpField";
// Services
import { sendOtp, verifyOtp, getUser } from "@/services/Auth.service";
// Store
import { getAuthUser, updateUser } from "@/store/auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
// Constants
import { OTP_LENGTH, ROUTE_PATHS } from "@/constants/common.constant";
// Utils
import { getErrorMessage } from "@/utils/util";
// Icons
import { Loader2Icon } from "lucide-react";

/**
 * Where a brand lands right after /brand/signup (account_status: "onboarding").
 * Only step for now is email verification, reusing the same OTP mechanism
 * Login uses — verifying moves the account to "pending_deposit" server-side,
 * which unlocks the rest of the app but not job posting; paying the security
 * deposit is what makes it "active".
 */
const BrandOnboarding = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(getAuthUser);

  const [otp, setOtp] = React.useState("");
  const [error, setError] = React.useState("");
  const [fieldError, setFieldError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const hasSentInitialOtp = React.useRef(false);

  const handleSendOtp = React.useCallback(async () => {
    if (!user?.email) {
      return;
    }

    setError("");
    try {
      await sendOtp({ email: user.email });
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "We could not send the code."));
    }
  }, [user?.email]);

  // Sends the first code automatically — the brand shouldn't have to click
  // anything to receive it, only to resend.
  React.useEffect(() => {
    if (hasSentInitialOtp.current || !user?.email) {
      return;
    }
    hasSentInitialOtp.current = true;
    handleSendOtp();
  }, [handleSendOtp, user?.email]);

  const handleVerify = React.useCallback(
    async (value: string = otp) => {
      if (!user?.email || value.length !== OTP_LENGTH) {
        setFieldError(`Enter the ${OTP_LENGTH} digit code`);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const response = await verifyOtp({ email: user.email, otp: value });
        if (!response?.status) {
          setFieldError("That code is invalid or has expired.");
          return;
        }

        // Verifying an email no longer means "active" — a brand still has to
        // pay its security deposit for that. Rather than guessing the next
        // status here, take whatever the server actually set, so the client
        // can't drift from the backend's lifecycle rules.
        const session = await getUser();
        if (session?.status) {
          dispatch(updateUser(session.user));
        } else {
          dispatch(updateUser({ email_verified: true }));
        }

        navigate(ROUTE_PATHS.HOME);
      } catch (caughtError) {
        setFieldError(getErrorMessage(caughtError, "That code is invalid."));
      } finally {
        setLoading(false);
      }
    },
    [dispatch, navigate, otp, user?.email],
  );

  return (
    <AuthCard
      title="Verify your email"
      description="One last step before you can start creating jobs."
      error={error}
    >
      <div className="grid gap-4">
        <OtpField
          value={otp}
          email={user?.email ?? ""}
          disabled={loading}
          error={fieldError}
          onChange={(value) => {
            setFieldError("");
            setOtp(value);
          }}
          onComplete={handleVerify}
          onResend={handleSendOtp}
        />

        <Button className="w-full" disabled={loading} onClick={() => handleVerify()}>
          {loading && <Loader2Icon className="animate-spin" />}
          Verify
        </Button>
      </div>
    </AuthCard>
  );
};

export default BrandOnboarding;
