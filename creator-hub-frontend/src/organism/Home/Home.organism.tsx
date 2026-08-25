// Modules
import { Link } from "react-router-dom";
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
// Store
import { getAuthUser } from "@/store/auth";
import { useAppSelector } from "@/store/hooks";
// Constants
import { PRIVILEGES, ROLES } from "@/constants/access.constant";
import { ROUTE_PATHS } from "@/constants/common.constant";
// Icons
import { CompassIcon, PlusIcon } from "lucide-react";

/**
 * Placeholder landing screen proving the authenticated session round trips.
 * The real creator dashboard replaces this.
 */
const Home = () => {
  const { user } = useAppSelector(getAuthUser);

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

      {/*
        Only a brand account can post jobs — invisible to a plain creator
        account rather than a dead link they can't use. Gated by role, not
        just privilege: a brand also holds EXPLORE_JOBS (it reuses that
        route to view jobs it posted), so privilege alone isn't enough to
        tell the two account types apart.
      */}
      <RequireAccess role={ROLES.BRAND} privilege={PRIVILEGES.CREATE_JOBS}>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-base">Post a job</CardTitle>
            <CardDescription>
              List a new affiliate job for creators to apply to.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link to={ROUTE_PATHS.CREATE_JOB} />}>
              <PlusIcon />
              Post a job
            </Button>
          </CardContent>
        </Card>
      </RequireAccess>

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
