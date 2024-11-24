import { ComponentType } from "react";
import Wallet from "./pages/Wallet";
import UnitConverter from "./pages/UnitConverter";

interface Route {
  path: string;
  Component: ComponentType;
}

export const routes: Route[] = [
  {
    path: "/",
    Component: UnitConverter
  },
  {
    path: "/wallet",
    Component: Wallet
  }
];
