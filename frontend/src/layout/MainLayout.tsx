// Store
import { useAppSelector } from "@/store/hooks";
import { isUserAuthorized } from "@/store/auth";
// Layouts
import Body from "@/layout/Body";
import SideNav from "@/layout/SideNav";
import Header from "@/layout/Header";
// Typings
import { TRoutes } from "@/typings/common";

const MainLayout = (props: { routes: TRoutes[]; childrens: JSX.Element }) => {
  const { routes, childrens } = props;
  const isAuthorized = useAppSelector(isUserAuthorized);

  return (
    <>
      {isAuthorized ? (
        <section style={{ paddingLeft: "60px" }}>
          <SideNav routes={routes} />
          <Header />
          <Body>{childrens}</Body>
        </section>
      ) : (
        <section><Body>{childrens}</Body></section>
      )}
    </>
  );
};

export default MainLayout;
