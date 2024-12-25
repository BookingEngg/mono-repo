// Typings
import { TRoutes } from "@/typings/common";
// Organism
import { Login } from "@/organism/Login";
// Layouts
import Body from "@/layout/Body";
import SideNav from "@/layout/SideNav";
import Header from "@/layout/Header";
import React from "react";

const MainLayout = (props: { routes: TRoutes[]; childrens: JSX.Element }) => {
  const { routes, childrens } = props;
  const [isLoginPage, setIsLoginPage] = React.useState(false);
  const makeUserLoggedIn = () => {
    setIsLoginPage(true);
  };
  const makeUserLogOut = () => {
    setIsLoginPage(false);
  };

  return isLoginPage ? (
    <section style={{ paddingLeft: "60px" }}>
      <SideNav routes={routes} />
      {/* <SideNavV2 routes={routes} /> */}
      <Header />
      <Body>{childrens}</Body>
    </section>
  ) : (
    <Login makeUserLoggedIn={makeUserLoggedIn} makeUserLogout={makeUserLogOut} />
  );
};

export default MainLayout;
