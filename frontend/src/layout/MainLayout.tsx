// Typings
import { TRoutes } from "@/typings/common";
// Layouts
import Body from "@/layout/Body";
import SideNav from "@/layout/SideNav";
import Header from "@/layout/Header";
import { increment } from "@/store/featureCounter";
import { Button } from "rsuite";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const MainLayout = (props: { routes: TRoutes[]; childrens: JSX.Element }) => {
  const count = useAppSelector((state) => state.counter.count);
  const dispatch = useAppDispatch();

  const { routes, childrens } = props;

  return (
    <section style={{ paddingLeft: "60px" }}>
      <SideNav routes={routes} />
      {/* <SideNavV2 routes={routes} /> */}
      <Header />
      <Body>
        {childrens} {count}
        <Button
          onClick={() => dispatch(increment())}
        >
          {" "}
          Increment
        </Button>
      </Body>
    </section>
  );
};

export default MainLayout;
