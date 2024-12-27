// Typings
import { TRoutes } from "@/typings/common";
// Layouts
import Body from "@/layout/Body";
import SideNav from "@/layout/SideNav";
import Header from "@/layout/Header";
// import { setCounterValue, getCounterValue } from "@/store/featureCounter";
import { login, getAuthUser } from "@/store/auth";
import { Button } from "rsuite";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import React from "react";

const payload = {
  user: {
    _id: "ljdkfad",
    first_name: "Tushar",
    last_name: "Chand Thakur",
    role: "admin",
  },
  isAuthorized: true,
};

const MainLayout = (props: { routes: TRoutes[]; childrens: JSX.Element }) => {
  const user = useAppSelector(getAuthUser);
  const dispatch = useAppDispatch();
  console.log(">>>>>>>>>>>>>>>>>>>>>", user);
  const { routes, childrens } = props;

  React.useEffect(() => {
    console.log(user)
  }, [user])

  return (
    <section style={{ paddingLeft: "60px" }}>
      <SideNav routes={routes} />
      {/* <SideNavV2 routes={routes} /> */}
      <Header />
      <Body>
        {childrens}
        <Button onClick={() => dispatch(login(payload))}>Click me</Button>
      </Body>
    </section>
  );
};

export default MainLayout;
