import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Menu } from "@mui/icons-material";
import ThemeSwitcher from "../ThemeSelector/light-dark-mode-switcher";
import ConnectWallet from "../ConnectWallet";

export function SideBar() {
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );
  const theme = isDarkTheme ? "dark" : "light";
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className={`${theme}`} variant={`outline`}>
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className={`${theme}`}>
        <SheetHeader>
          <SheetTitle className="text-primary-text text-start text-4xl">
            <p className="flex gap-2 items-center">
              Nautilus <ThemeSwitcher />
            </p>
          </SheetTitle>
          <SheetDescription className="text-start">
            Explore Nautilus
          </SheetDescription>
        </SheetHeader>
        <ul className="flex flex-col gap-4 py-4">
            <li></li>
        </ul>
        <SheetFooter>
          <SheetClose asChild>
            <ConnectWallet  />
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
