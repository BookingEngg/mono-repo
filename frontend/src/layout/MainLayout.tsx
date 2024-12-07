// Typings
import { TRoutes } from "@/typings/common";
// Layouts
import Body from "@/layout/Body";
import SideNav from "@/layout/SideNav";
import Header from "@/layout/Header";

const MainLayout = (props: { routes: TRoutes[]; childrens: JSX.Element }) => {
  const { routes, childrens } = props;

  return (
    <section style={{ paddingLeft: "60px" }}>
      <SideNav routes={routes}/>
      {/* <SideNavV2 routes={routes} /> */}
      <Header />
      <Body>{childrens}</Body>
    </section>
  );
};

export default MainLayout;