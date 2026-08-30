// Modules
import { toast } from "sonner";
// Atoms
import { Button } from "@/atoms/ui/button";
// Hooks
import usePayment from "@/hooks/usePayment";
// Utils
import { cn } from "@/lib/utils";
// Typings
import {
  TPaymentStatus,
  TPaymentType,
  TSettlementScope,
} from "@/typings/payment";
// Icons
import { Loader2Icon } from "lucide-react";

type TPaymentButtonProps = {
  paymentType: TPaymentType;
  paymentCycleId?: string;
  settlementScope?: TSettlementScope;
  settlementReference?: string;
  children?: React.ReactNode;
  description?: string;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  disabled?: boolean;
  successMessage?: string;
  onSuccess?: (orderId: string) => void;
  onIncomplete?: (status: TPaymentStatus) => void;
  onFailure?: (message: string) => void;
};

/**
 * Drop-in "accept a payment" button. Runs initiate-payment → gateway SDK →
 * verify-payment on click.
 *
 * Callers say what is being paid for (`paymentType`), never how much — the
 * server prices it and picks the gateway. That keeps this usable for any
 * payment in the app and impossible to misuse into charging a client-chosen
 * amount.
 */
const PaymentButton = ({
  paymentType,
  paymentCycleId,
  settlementScope,
  settlementReference,
  children = "Pay now",
  description,
  className,
  variant,
  size,
  disabled,
  successMessage = "Payment successful.",
  onSuccess,
  onIncomplete,
  onFailure,
}: TPaymentButtonProps) => {
  const { startPayment, loading } = usePayment({
    paymentType,
    paymentCycleId,
    settlementScope,
    settlementReference,
    description,
    onSuccess: (orderId) => {
      toast.success(successMessage);
      onSuccess?.(orderId);
    },
    onIncomplete: (status) => {
      // `pending` means the bank authorized it but capture hasn't landed —
      // telling the customer it failed would be wrong, and so would silence.
      if (status === "pending") {
        toast.info("Your payment is still processing. We'll update it shortly.");
      }
      onIncomplete?.(status);
    },
    onFailure: (message) => {
      toast.error(message);
      onFailure?.(message);
    },
  });

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn("w-full", className)}
      disabled={disabled || loading}
      onClick={startPayment}
    >
      {loading && <Loader2Icon className="animate-spin" />}
      {children}
    </Button>
  );
};

export default PaymentButton;
