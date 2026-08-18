// Modules
import { Outlet } from "react-router-dom";
// Molecules
import { BottomNav } from "@/molecules/BottomNav";
import { MobileHeader } from "@/molecules/MobileHeader";
import { SideNav } from "@/molecules/SideNav";

/**
 * Shell for every authenticated screen. Mobile gets a top brand bar plus a
 * fixed bottom tab bar; from the md breakpoint up SideNav replaces both.
 *
 * This outer cap is deliberately generous (not the old max-w-3xl) so a
 * grid page like Explore actually gets to use a wide desktop viewport
 * instead of leaving a huge dead gap on either side. Pages that read better
 * narrow (Profile, Home, CreateJob) cap their own content locally instead.
 */
const MainLayout = () => {
  return (
    <div className="bg-background min-h-svh md:flex">
      <SideNav />

      <div className="flex min-h-svh flex-1 flex-col">
        <MobileHeader />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-24 md:px-10 md:py-10">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default MainLayout;
