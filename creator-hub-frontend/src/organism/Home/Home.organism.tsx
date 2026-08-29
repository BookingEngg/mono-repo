// Modules
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// Atoms
import { RequireAccess } from "@/atoms/RequireAccess";
import { Button } from "@/atoms/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/atoms/ui/card";
import { ExploreJobsIllustration } from "@/atoms/illustrations";
// Molecules
import { HomeWidget } from "@/molecules/HomeWidget";
// Services
import { getHomeWidgets } from "@/services/Home.service";
// Store
import { getAuthUser } from "@/store/auth";
import { useAppSelector } from "@/store/hooks";
// Constants
import { PRIVILEGES, ROLES } from "@/constants/access.constant";
import { ROUTE_PATHS } from "@/constants/common.constant";
// Icons
import { CompassIcon } from "lucide-react";

/**
 * Placeholder landing screen proving the authenticated session round trips.
 * The real creator dashboard replaces this.
 */
const Home = () => {
  const { user } = useAppSelector(getAuthUser);

  // Which widgets come back is decided server-side from the account's roles,
  // so this renders whatever it's given rather than re-implementing those
  // rules. A creator currently gets an empty list.
  const { data: widgets = [] } = useQuery({
    queryKey: ["home-widgets"],
    queryFn: getHomeWidgets,
  });

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">
          Welcome{user?.first_name ? `, ${user.first_name}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm">
          Here's what's happening across your campaigns today.
        </p>
      </div>

      {widgets.map((widget) => (
        <HomeWidget key={widget.id} widget={widget} />
      ))}

      {/*
        Influencer landing had nothing to look at once signed in — this gives
        a first-time creator an obvious next step into Explore instead of a
        blank page. Gated by role so a brand account (which also holds
        EXPLORE_JOBS, for viewing jobs it posted) never sees creator-facing
        copy on its own home page.
      */}
      <RequireAccess role={ROLES.INFLUENCER} privilege={PRIVILEGES.EXPLORE_JOBS}>
        <Card className="overflow-hidden">
          <ExploreJobsIllustration className="h-auto w-full max-w-sm self-center py-4" />
          <CardHeader>
            <CardTitle className="text-base">
              Start earning as a creator
            </CardTitle>
            <CardDescription>
              Browse affiliate jobs from brands looking for creators like you,
              apply in a tap, and start sharing your link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link to={ROUTE_PATHS.EXPLORE} />}>
              <CompassIcon />
              Explore jobs
            </Button>
          </CardContent>
        </Card>
      </RequireAccess>
    </div>
  );
};

export default Home;
