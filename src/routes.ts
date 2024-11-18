import SearchName from "./pages/SearchName";
import RegisterName from "./pages/RegisterName";
import MyNames from "./pages/MyNames";

interface Route {
  path: string;
  Component: React.ComponentType;
}

export const routes: Route[] = [
  {
    path: "/",
    Component: SearchName,
  },
  {
    path: "/search",
    Component: SearchName,
  },
  {
    path: "/register",
    Component: RegisterName,
  },
  {
    path: "/my-names",
    Component: MyNames,
  },
];
