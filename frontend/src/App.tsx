import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginRoutes from "@/pages/Login/Login.routes";
import PaymentRoutes from "@/pages/Payment/Payment.routes";
import { TRoutes } from "@/typings/common";
import SettingsRoutes from "./pages/Settings";
import MainLayout from "@/layout/MainLayout";

/**
 * Get all the routes passing in the routes parameter
 */
const getAllRoutes = (routes: TRoutes[]) => {
  return routes.map((route) => (
    <Route key={route.key} path={route.path} element={route.element}>
      {route.children && getAllRoutes(route.children)}
    </Route>
  ));
};

function App() {

  // Contain all pages routes
  const allRoutes: TRoutes[] = [
    ...LoginRoutes(),
    ...PaymentRoutes(),
    ...SettingsRoutes(),
  ];

  return (
    <>
      <BrowserRouter>
        <MainLayout routes={allRoutes}/>
        <Routes>{getAllRoutes(allRoutes)}</Routes>
      </BrowserRouter>
    </>
  );
}
export default App;
