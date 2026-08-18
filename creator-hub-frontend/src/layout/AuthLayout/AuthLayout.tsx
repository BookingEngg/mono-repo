// Modules
import { Outlet } from "react-router-dom";

/**
 * Centres the auth cards on a branded backdrop. Rendered as a route layout so
 * every unauthenticated screen shares one frame.
 */
const AuthLayout = () => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex items-center gap-2 self-center font-semibold">
        <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md text-sm">
          CH
        </span>
        Creator Hub
      </div>

      <Outlet />

      <p className="text-muted-foreground max-w-md text-center text-xs text-balance">
        By continuing you agree to the Creator Hub terms of service and privacy
        policy.
      </p>
    </div>
  );
};

export default AuthLayout;
