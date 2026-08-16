// Store
import { getAuthUser } from "@/store/auth";
import { useAppSelector } from "@/store/hooks";

/**
 * Placeholder landing screen proving the authenticated session round trips.
 * The real creator dashboard replaces this.
 */
const Home = () => {
  const { user } = useAppSelector(getAuthUser);

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold">
        Welcome{user?.first_name ? `, ${user.first_name}` : ""}
      </h1>
      <p className="text-muted-foreground text-sm">
        Here's what's happening across your campaigns today.
      </p>
    </div>
  );
};

export default Home;
