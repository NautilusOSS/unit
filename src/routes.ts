import { ComponentType } from "react";
import UnitHome from "./pages/UnitHome";
import Wallet from "./pages/Wallet";
import UnitConverter from "./pages/UnitConverter";

interface Route {
  path: string;
  Component: ComponentType;
}

export const routes: Route[] = [
  {
    path: "/",
    Component: UnitHome
  },
  {
    path: "/wallet",
    Component: Wallet
  },
  {
    path: "/converter",
    Component: UnitConverter
  }
];
