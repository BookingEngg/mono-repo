// Modules
import React from "react";
// Atoms
import { Button } from "@/atoms/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/atoms/ui/card";
import { Label } from "@/atoms/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/atoms/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/atoms/ui/alert";
// Molecules
import { PaymentSummary } from "@/molecules/PaymentSummary";
// Services
import {
  getPaymentCheckoutDetails,
  initiatePayment,
  verifyPayment,
} from "@/services/Payment.service";
// Utils
import { openGatewayCheckout } from "@/lib/paymentGateways";
import { getErrorMessage } from "@/utils/util";
// Typings
import { TPaymentType } from "@/typings/payment";
// Icons
import { Loader2Icon, TrashIcon } from "lucide-react";

const PAYMENT_TYPE_OPTIONS: { value: TPaymentType; label: string }[] = [
  { value: "security_deposit", label: "security_deposit (₹1000, implemented)" },
  { value: "online", label: "online (needs a billing cycle — expected to fail)" },
];

type TLogEntry = {
  id: number;
  step: string;
  ok: boolean;
  detail: string;
  at: string;
};

/**
 * Developer sandbox for the payment sequence.
 *
 * Two panels on purpose:
 *  - left  : the real drop-in <PaymentSummary />, i.e. exactly what a product
 *            screen would render, so the component itself gets exercised.
 *  - right : the same three calls driven by hand, logging each raw response,
 *            so a failure can be pinned to a specific step rather than just
 *            surfacing as a toast.
 */
const PaymentSandbox = () => {
  const [paymentType, setPaymentType] =
    React.useState<TPaymentType>("security_deposit");
  const [running, setRunning] = React.useState(false);
  const [logs, setLogs] = React.useState<TLogEntry[]>([]);

  const logIdRef = React.useRef(0);

  const appendLog = React.useCallback(
    (step: string, ok: boolean, detail: unknown) => {
      logIdRef.current += 1;
      setLogs((previous) => [
        ...previous,
        {
          id: logIdRef.current,
          step,
          ok,
          detail:
            typeof detail === "string" ? detail : JSON.stringify(detail, null, 2),
          at: new Date().toLocaleTimeString(),
        },
      ]);
    },
    [],
  );

  /**
   * Drives checkout -> initiate -> SDK -> verify by hand, logging each step.
   * Mirrors what usePayment does internally, including calling verify on
   * *any* SDK close (paid or dismissed) rather than only on success.
   */
  const runSequence = React.useCallback(async () => {
    setRunning(true);
    setLogs([]);

    try {
      appendLog("1. GET /checkout", true, "requesting…");
      const checkout = await getPaymentCheckoutDetails({
        payment_type: paymentType,
      });
      appendLog("1. GET /checkout", true, checkout);

      appendLog("2. POST /payment/initiate-payment", true, "requesting…");
      const order = await initiatePayment({ payment_type: paymentType });
      appendLog("2. POST /payment/initiate-payment", true, order);

      appendLog(
        "3. opening gateway SDK",
        true,
        `provider=${order.sdk_payload.provider} order=${order.sdk_payload.gateway_order_id}`,
      );

      await openGatewayCheckout({
        sdkPayload: order.sdk_payload,
        name: "Creator Hub (sandbox)",
        description: checkout.title,
        onAttemptFailed: (message) =>
          appendLog("3. SDK attempt failed (sheet still open)", false, message),
        onClosed: async () => {
          appendLog(
            "4. SDK closed",
            true,
            "verifying with the server (outcome is polled from the gateway, not taken from the browser)",
          );

          try {
            const result = await verifyPayment({ order_id: order.order_id });
            appendLog("4. POST /payment/verify-payment", result.is_paid, result);
          } catch (caughtError) {
            appendLog(
              "4. POST /payment/verify-payment",
              false,
              getErrorMessage(caughtError),
            );
          } finally {
            setRunning(false);
          }
        },
      });
    } catch (caughtError) {
      appendLog("sequence aborted", false, getErrorMessage(caughtError));
      setRunning(false);
    }
  }, [appendLog, paymentType]);

  return (
    <div className="grid gap-6 py-4">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold">Payment sandbox</h1>
        <p className="text-muted-foreground text-sm">
          Exercises <code>/checkout</code> →{" "}
          <code>/payment/initiate-payment</code> → gateway SDK →{" "}
          <code>/payment/verify-payment</code>.
        </p>
      </div>

      <Alert>
        <AlertTitle>Use Razorpay test credentials</AlertTitle>
        <AlertDescription>
          This charges whatever keys are in the backend config. With test keys,
          card <code>4111 1111 1111 1111</code>, any future expiry and any CVV
          will complete a payment. Never point this at live keys.
        </AlertDescription>
      </Alert>

      <div className="grid max-w-xs gap-2">
        <Label htmlFor="payment_type">Payment type</Label>
        <Select
          value={paymentType}
          onValueChange={(value) => setPaymentType(value as TPaymentType)}
        >
          <SelectTrigger id="payment_type" className="w-full">
            <SelectValue placeholder="Select a payment type" />
          </SelectTrigger>
          <SelectContent className="min-w-72">
            {PAYMENT_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid content-start gap-2">
          <h2 className="text-sm font-medium">
            Drop-in component (&lt;PaymentSummary /&gt;)
          </h2>
          <p className="text-muted-foreground text-xs">
            Exactly what a product screen renders. Re-mounts when the type
            changes so the /checkout call re-runs.
          </p>
          <PaymentSummary
            key={paymentType}
            paymentType={paymentType}
            note="Sandbox — uses whichever gateway keys the backend is configured with."
          />
        </div>

        <div className="grid content-start gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Step-by-step runner</h2>
            {logs.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLogs([])}
                disabled={running}
              >
                <TrashIcon />
                Clear
              </Button>
            )}
          </div>

          <Button onClick={runSequence} disabled={running}>
            {running && <Loader2Icon className="animate-spin" />}
            Run the full sequence
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Request log</CardTitle>
              <CardDescription className="text-xs">
                Raw responses, in order.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {logs.length === 0 && (
                <p className="text-muted-foreground text-xs">
                  Nothing yet — run the sequence above.
                </p>
              )}

              {logs.map((entry) => (
                <div key={entry.id} className="grid gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={
                        entry.ok
                          ? "text-xs font-medium"
                          : "text-destructive text-xs font-medium"
                      }
                    >
                      {entry.step}
                    </span>
                    <span className="text-muted-foreground shrink-0 text-[11px]">
                      {entry.at}
                    </span>
                  </div>
                  <pre className="bg-muted overflow-x-auto rounded-md p-2 text-[11px] leading-relaxed">
                    {entry.detail}
                  </pre>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSandbox;
