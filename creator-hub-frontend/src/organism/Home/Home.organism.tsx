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
// Store
import { getAuthUser } from "@/store/auth";
import { useAppSelector } from "@/store/hooks";
// Constants
import { PRIVILEGES } from "@/constants/access.constant";
import { ROUTE_PATHS } from "@/constants/common.constant";
// Icons
import { PlusIcon } from "lucide-react";

/**
 * Placeholder landing screen proving the authenticated session round trips.
 * The real creator dashboard replaces this.
 */
const Home = () => {
  const { user } = useAppSelector(getAuthUser);

  return (
    <div className="flex flex-col gap-6">
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
        account rather than a dead link they can't use.
      */}
      <RequireAccess privilege={PRIVILEGES.CREATE_JOBS}>
        <Card>
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
    </div>
  );
};

export default Home;
