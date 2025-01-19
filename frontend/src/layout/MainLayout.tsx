// Store
import { useAppSelector } from "@/store/hooks";
import { isUserAuthorized } from "@/store/auth";
// Layouts
import Body from "@/layout/Body";
import SideNav from "@/layout/SideNav";
import Header from "@/layout/Header";
// Typings
import { TRoutes } from "@/typings/common";
import { Button } from "rsuite";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/auth";

const MainLayout = (props: { routes: TRoutes[]; childrens: JSX.Element }) => {
  const dispatch = useAppDispatch();
  const { routes, childrens } = props;
  const isAuthorized = useAppSelector(isUserAuthorized);

  return (
    <section style={{ paddingLeft: "60px" }}>
      {isAuthorized && (
        <>
          <SideNav routes={routes} />
          <Header />
        </>
      )}
      <Body>{childrens}
        <Button onClick={() => {dispatch(logout())}}>Logout</Button>
      </Body>
    </section>
  );
};

export default MainLayout;
