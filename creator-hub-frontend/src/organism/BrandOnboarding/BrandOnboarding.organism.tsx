// Modules
import React from "react";
import { useNavigate } from "react-router-dom";
// Atoms
import { Button } from "@/atoms/ui/button";
// Molecules
import { AuthCard } from "@/molecules/AuthCard";
import { OtpField } from "@/molecules/OtpField";
// Services
import { sendOtp, verifyOtp } from "@/services/Auth.service";
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
 * Login uses — verifying flips the account to "active" server-side, so this
 * is also the page a returning brand would eventually complete if they
 * somehow land here again mid-verification.
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

        dispatch(
          updateUser({ email_verified: true, account_status: "active" }),
        );
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
