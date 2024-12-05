import { TRoutes } from "@/typings/common";
import { createContext } from "react";

type currentRouteContextType = {
  currentRoute?: TRoutes;
};

export default createContext({} as currentRouteContextType);
