// Modules
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
// Atoms
import { Button } from "@/atoms/ui/button";
import { Alert, AlertTitle } from "@/atoms/ui/alert";
// Molecules
import { PaymentSummary } from "@/molecules/PaymentSummary";
// Constants
import { ROUTE_PATHS } from "@/constants/common.constant";
// Typings
import { TPaymentType, TSettlementScope } from "@/typings/payment";
// Icons
import { ArrowLeftIcon } from "lucide-react";

// URL segments a user may legitimately land on. Anything else is rejected
// rather than forwarded to the API, so a hand-typed path can't probe for
// payment types that aren't meant to be self-serve.
const SUPPORTED_PAYMENT_TYPES: TPaymentType[] = ["security_deposit", "online"];

// Slices a settlement may be scoped to, whitelisted for the same reason as
// the payment types above.
const SUPPORTED_SCOPES: TSettlementScope[] = ["job", "creator"];

/**
 * Checkout screen for a standalone payment (as opposed to a job application
 * checkout). Reached from a home widget.
 */
const PaymentCheckout = () => {
  const navigate = useNavigate();
  const { paymentType } = useParams<{ paymentType: string }>();
  const [searchParams] = useSearchParams();

  // An "online" settlement carries which slice it covers. The server re-reads
  // the pending earnings for that slice and prices it — these params only say
  // WHICH slice, never how much.
  const scopeParam = searchParams.get("scope") as TSettlementScope | null;
  const reference = searchParams.get("ref") ?? undefined;
  const settlementScope =
    scopeParam && SUPPORTED_SCOPES.includes(scopeParam)
      ? scopeParam
      : undefined;

  const isSupported =
    SUPPORTED_PAYMENT_TYPES.includes(paymentType as TPaymentType) &&
    // A settlement without a slice has nothing to price.
    (paymentType !== "online" || (!!settlementScope && !!reference));

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
          settlementScope={settlementScope}
          settlementReference={reference}
          actionLabel={paymentType === "online" ? "Settle now" : "Pay now"}
          // Land back where the brand came from so the row they just settled
          // re-fetches and shows its new position.
          onSuccess={() =>
            navigate(
              paymentType === "online"
                ? ROUTE_PATHS.SETTLEMENT
                : ROUTE_PATHS.HOME,
            )
          }
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
