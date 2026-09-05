// Modules
import { Link } from "react-router-dom";
// Atoms
import { Button } from "@/atoms/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/atoms/ui/card";
// Utils
import { formatCurrency } from "@/utils/util";
// Constants
import {
  ROUTE_PATHS,
  getPaymentCheckoutPath,
} from "@/constants/common.constant";
// Typings
import { IHomeWidget } from "@/typings/home";
// Icons
import { CheckCircle2Icon, PlusIcon, UserPenIcon } from "lucide-react";

type THomeWidgetProps = {
  widget: IHomeWidget;
};

/**
 * Renders one home widget. The server decides what a widget says and which
 * action it carries; this only maps that action vocabulary onto a real client
 * route and icon, so a new widget reusing an existing action needs no change
 * here.
 *
 * Icons stay client-side deliberately — they're assets this app owns, not
 * something the API should be describing.
 */
const HomeWidget = ({ widget }: THomeWidgetProps) => {
  const resolveAction = (): { href: string; icon?: React.ReactNode } | null => {
    switch (widget.action.type) {
      case "payment_checkout":
        return widget.action.payment_type
          ? { href: getPaymentCheckoutPath(widget.action.payment_type) }
          : null;

      case "create_job":
        return { href: ROUTE_PATHS.CREATE_JOB, icon: <PlusIcon /> };

      case "open_profile":
        // The section rides in the query string so the profile page can open
        // that accordion, and so the link stays shareable/back-button safe.
        return {
          href: widget.action.section
            ? `${ROUTE_PATHS.PROFILE}?section=${widget.action.section}`
            : ROUTE_PATHS.PROFILE,
          icon: <UserPenIcon />,
        };

      default:
        // An action type this client build doesn't know yet — render the card
        // without a dead button rather than crashing on a newer server.
        return null;
    }
  };

  const action = resolveAction();

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {widget.title}
          {widget.is_completed && (
            <CheckCircle2Icon className="size-4 text-emerald-600" />
          )}
        </CardTitle>
        {widget.description && (
          <CardDescription>{widget.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="grid gap-3">
        {widget.amount !== undefined && (
          <p className="text-2xl font-semibold">
            {formatCurrency(widget.amount, widget.currency)}
          </p>
        )}

        {action && (
          <Button
            className="justify-self-start"
            variant={widget.is_completed ? "outline" : "default"}
            render={<Link to={action.href} />}
          >
            {action.icon}
            {widget.cta_label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default HomeWidget;
