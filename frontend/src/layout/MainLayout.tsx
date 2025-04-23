// Store
import { useAppSelector } from "@/store/hooks";
import { isUserAuthorized } from "@/store/auth";
// Layouts
import Body from "@/layout/Body";
import SideNav from "@/layout/SideNav";
import Header from "@/layout/Header";
// Typings
import { TRoutes } from "@/typings/common";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

const MainLayout = (props: { routes: TRoutes[]; childrens: JSX.Element }) => {
  const { routes, childrens } = props;
  const isAuthorized = useAppSelector(isUserAuthorized);

  React.useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark", "soft")
    root.classList.add("dark")
  }, [])

  // return (
  //   <>
  //     {isAuthorized ? (
  //       <section style={{ paddingLeft: "60px" }}>
  //         <SideNav routes={routes} />
  //         <Header />
  //         <Body>{childrens}</Body>
  //       </section>
  //     ) : (
  //       <section>
  //         <Body>{childrens}</Body>
  //       </section>
  //     )}
  //   </>
  // );

  return (
    <>
      {isAuthorized ? (
        <SidebarProvider className="flex gap-5 bg-background">
          <SideNav routes={routes} />
          <div className="w-full">
            <Header />
            <Body>{childrens}</Body>
          </div>
        </SidebarProvider>
      ) : (
        <Body>{childrens}</Body>
      )}
    </>
  );
};

export default MainLayout;
