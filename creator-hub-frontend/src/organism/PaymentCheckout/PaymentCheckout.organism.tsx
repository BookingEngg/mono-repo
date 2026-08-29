// Modules
import { useNavigate, useParams } from "react-router-dom";
// Atoms
import { Button } from "@/atoms/ui/button";
import { Alert, AlertTitle } from "@/atoms/ui/alert";
// Molecules
import { PaymentSummary } from "@/molecules/PaymentSummary";
// Constants
import { ROUTE_PATHS } from "@/constants/common.constant";
// Typings
import { TPaymentType } from "@/typings/payment";
// Icons
import { ArrowLeftIcon } from "lucide-react";

// URL segments a user may legitimately land on. Anything else is rejected
// rather than forwarded to the API, so a hand-typed path can't probe for
// payment types that aren't meant to be self-serve.
const SUPPORTED_PAYMENT_TYPES: TPaymentType[] = ["security_deposit"];

/**
 * Checkout screen for a standalone payment (as opposed to a job application
 * checkout). Reached from a home widget.
 */
const PaymentCheckout = () => {
  const navigate = useNavigate();
  const { paymentType } = useParams<{ paymentType: string }>();

  const isSupported = SUPPORTED_PAYMENT_TYPES.includes(
    paymentType as TPaymentType,
  );

  return (
    <div className="mx-auto grid w-full max-w-lg gap-4 py-4">
      <Button
        variant="ghost"
        size="sm"
        className="justify-self-start"
        onClick={() => navigate(ROUTE_PATHS.HOME)}
      >
        <ArrowLeftIcon />
        Back
      </Button>

      {isSupported ? (
        <PaymentSummary
          paymentType={paymentType as TPaymentType}
          // Land back on home once paid so the widget re-fetches and shows
          // its settled state, rather than leaving the user on a dead screen.
          onSuccess={() => navigate(ROUTE_PATHS.HOME)}
        />
      ) : (
        <Alert variant="destructive">
          <AlertTitle>That payment type isn't available.</AlertTitle>
        </Alert>
      )}
    </div>
  );
};

export default PaymentCheckout;
