import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import LoginRoutes from "./pages/Login";
import PaymentRoutes from "./pages/Payment";
import { TRoutes } from "./typings/common";

/**
 * Get all the routes passing in the routes parameter
 */
const getAllRoutes = (routes: TRoutes[]) => {
  return routes.map((route) => (
    <Route path={route.path} element={route.element}>
      {route.children && getAllRoutes(route.children)}
    </Route>
  ));
};

function App() {
  // Contain all pages routes
  const allRoutes: TRoutes[] = [...LoginRoutes(), ...PaymentRoutes()];

  return (
    <>
      <BrowserRouter>
        <Routes>{getAllRoutes(allRoutes)}</Routes>
      </BrowserRouter>
    </>
  );
}
export default App;
