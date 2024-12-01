import { TRoutes } from "@/typings/common";
import React from "react";
import { Location } from "react-router-dom";
import { Nav } from "rsuite";

const Header = (props: { routes: TRoutes[], selectedRoute: Location }) => {
  const { routes } = props;

  return routes.map((route) => {

    return <></>;
  });
};

const SetAvailableTab = ({...props}) => {
  return (
    <Nav {...props} appearance="subtle">
      <Nav.Item eventKey="home">Home</Nav.Item>
      <Nav.Item eventKey="news">News</Nav.Item>
      <Nav.Item eventKey="solutions">Solutions</Nav.Item>
      <Nav.Item eventKey="products">Products</Nav.Item>
      <Nav.Item eventKey="about">About</Nav.Item>

      

    </Nav>
  );
};

export default Header;
