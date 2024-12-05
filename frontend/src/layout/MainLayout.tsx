// Typings
import { TRoutes } from "@/typings/common";
// Layouts
import Body from "@/layout/Body";
import SideNavV2 from "@/layout/SideNavV2";
import Header from "@/layout/Header";

const MainLayout = (props: { routes: TRoutes[]; childrens: JSX.Element }) => {
  const { routes, childrens } = props;

  return (
    <section style={{ paddingLeft: "60px" }}>
      <SideNavV2 routes={routes} />
      <Header />
      <Body>{childrens}</Body>
    </section>
  );
};

export default MainLayout;