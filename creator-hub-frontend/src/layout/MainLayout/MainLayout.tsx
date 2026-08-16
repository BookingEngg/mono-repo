// Modules
import { Outlet } from "react-router-dom";
// Molecules
import { BottomNav } from "@/molecules/BottomNav";
import { SideNav } from "@/molecules/SideNav";

/**
 * Shell for every authenticated screen. Mobile gets a fixed bottom tab bar;
 * from the md breakpoint up that's replaced by a persistent side rail, and the
 * content column is capped so text doesn't stretch edge to edge on a wide
 * viewport.
 */
const MainLayout = () => {
  return (
    <div className="bg-background min-h-svh md:flex">
      <SideNav />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-6 pb-24 md:px-10 md:py-10">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
};

export default MainLayout;
