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
// Constants
import { ROUTE_PATHS } from "@/constants/common.constant";

type TAccessDeniedProps = {
  title?: string;
  description?: string;
};

/**
 * Fallback for any route gated by RequireAccess. Rendered in place of the
 * restricted page rather than redirecting, so the creator understands why
 * they landed here instead of just bouncing back to the hub.
 */
const AccessDenied = ({
  title = "You don't have access to this page",
  description = "Your account doesn't have the permissions needed to view this.",
}: TAccessDeniedProps) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" render={<Link to={ROUTE_PATHS.HOME} />}>
          Back to Creator Hub
        </Button>
      </CardContent>
    </Card>
  );
};

export default AccessDenied;
