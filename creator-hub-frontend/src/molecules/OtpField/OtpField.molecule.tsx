// Modules
import React from "react";
// Atoms
import { Button } from "@/atoms/ui/button";
import { Label } from "@/atoms/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/atoms/ui/input-otp";
// Constants
import { OTP_LENGTH, OTP_RESEND_INTERVAL } from "@/constants/common.constant";

type TOtpFieldProps = {
  value: string;
  email: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  onResend: () => void;
  disabled?: boolean;
  error?: string;
};

/**
 * OTP entry with the resend cooldown. The countdown lives here rather than in the
 * organism so Login and Signup share one implementation of the throttle.
 */
const OtpField = ({
  value,
  email,
  onChange,
  onComplete,
  onResend,
  disabled,
  error,
}: TOtpFieldProps) => {
  const [secondsLeft, setSecondsLeft] = React.useState(OTP_RESEND_INTERVAL);

  React.useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timerId = window.setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => window.clearTimeout(timerId);
  }, [secondsLeft]);

  const handleResend = React.useCallback(() => {
    onResend();
    setSecondsLeft(OTP_RESEND_INTERVAL);
  }, [onResend]);

  return (
    <div className="grid gap-2">
      <Label htmlFor="otp">Verification code</Label>
      <p className="text-muted-foreground text-xs">
        We sent a {OTP_LENGTH} digit code to <span className="text-foreground font-medium">{email}</span>
      </p>

      <InputOTP
        id="otp"
        maxLength={OTP_LENGTH}
        value={value}
        disabled={disabled}
        onChange={onChange}
        onComplete={onComplete}
        containerClassName="justify-center py-2"
      >
        <InputOTPGroup>
          {Array.from({ length: OTP_LENGTH }).map((_, index) => (
            <InputOTPSlot key={index} index={index} aria-invalid={!!error} />
          ))}
        </InputOTPGroup>
      </InputOTP>

      {error && <p className="text-destructive text-center text-xs">{error}</p>}

      <div className="flex items-center justify-center gap-1 text-xs">
        <span className="text-muted-foreground">Didn't get the code?</span>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs"
          disabled={disabled || secondsLeft > 0}
          onClick={handleResend}
        >
          {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend code"}
        </Button>
      </div>
    </div>
  );
};

export default OtpField;
