// Modules
import { useQuery } from "@tanstack/react-query";
// Atoms
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/atoms/ui/card";
import { Separator } from "@/atoms/ui/separator";
import { Alert, AlertTitle } from "@/atoms/ui/alert";
// Molecules
import { PaymentButton } from "@/molecules/PaymentButton";
// Services
import { getPaymentCheckoutDetails } from "@/services/Payment.service";
// Utils
import { formatCurrency, getErrorMessage } from "@/utils/util";
// Typings
import { TPaymentStatus, TPaymentType } from "@/typings/payment";
// Icons
import { Loader2Icon } from "lucide-react";

type TPaymentSummaryProps = {
  paymentType: TPaymentType;
  paymentCycleId?: string;
  actionLabel?: string;
  note?: string;
  onSuccess?: (orderId: string) => void;
  onIncomplete?: (status: TPaymentStatus) => void;
};

/**
 * Drop-in payment panel: give it what is being paid for and it runs the whole
 * sequence — /checkout for the summary, then /initiate-payment and
 * /verify-payment behind the button.
 *
 * Every amount shown here comes from the server and is display-only; the
 * server re-derives the real charge from `paymentType` at initiate time, so
 * nothing rendered can influence what is actually charged.
 */
const PaymentSummary = ({
  paymentType,
  paymentCycleId,
  actionLabel = "Pay now",
  note,
  onSuccess,
  onIncomplete,
}: TPaymentSummaryProps) => {
  const {
    data: checkout,
    isPending,
    error,
  } = useQuery({
    queryKey: ["payment-checkout", paymentType, paymentCycleId],
    queryFn: () =>
      getPaymentCheckoutDetails({
        payment_type: paymentType,
        payment_cycle_id: paymentCycleId,
      }),
  });

  if (isPending) {
    return (
      <Card>
        <CardContent className="text-muted-foreground flex items-center justify-center py-10">
          <Loader2Icon className="animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error || !checkout) {
    return (
      <Alert variant="destructive">
        <AlertTitle>
          {getErrorMessage(error, "We could not load the payment details.")}
        </AlertTitle>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{checkout.title}</CardTitle>
        {checkout.description && (
          <CardDescription>{checkout.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="grid gap-3">
        {checkout.line_items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium">
              {formatCurrency(item.amount, checkout.currency)}
            </span>
          </div>
        ))}

        <Separator />

        <div className="flex items-center justify-between">
          <span className="font-medium">Total</span>
          <span className="text-lg font-semibold">
            {formatCurrency(checkout.total, checkout.currency)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="grid gap-2">
        <PaymentButton
          paymentType={paymentType}
          paymentCycleId={paymentCycleId}
          description={checkout.title}
          onSuccess={onSuccess}
          onIncomplete={onIncomplete}
        >
          {actionLabel}
        </PaymentButton>

        {note && (
          <p className="text-muted-foreground text-center text-xs">{note}</p>
        )}
      </CardFooter>
    </Card>
  );
};

export default PaymentSummary;
