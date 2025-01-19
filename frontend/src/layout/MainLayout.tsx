// Layouts
import Body from "@/layout/Body";
import SideNav from "@/layout/SideNav";
import Header from "@/layout/Header";
// Typings
import { TRoutes } from "@/typings/common";
import { useSelector } from "react-redux";
import { isUserAuthorized } from "@/store/auth";

const MainLayout = (props: { routes: TRoutes[]; childrens: JSX.Element }) => {
  const { routes, childrens } = props;
  const isAuthorized = useSelector(isUserAuthorized);

  return (
    <section style={{ paddingLeft: "60px" }}>
      {isAuthorized && (
        <>
          <SideNav routes={routes} />
          <Header />
        </>
      )}
      <Body>{childrens}</Body>
    </section>
  );
};

export default MainLayout;
