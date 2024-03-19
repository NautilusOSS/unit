import styled from "@emotion/styled";
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LightLogo from "static/logo-light.svg";
import DarkLogo from "static/logo-dark.svg";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import ThemeSelector from "../ThemeSelector";

import Box from "@mui/material/Box";
import Popper from "@mui/material/Popper";
import Fade from "@mui/material/Fade";
import { useWallet } from "@txnlab/use-wallet";
import { Chip, Divider, Stack } from "@mui/material";

import { useCopyToClipboard } from "usehooks-ts";
import { toast } from "react-toastify";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import { arc200 } from "ulujs";
import { TOKEN_VIA } from "../../contants/tokens";
import { getAlgorandClients } from "../../wallets";
import { arc200_balanceOf } from "ulujs/types/arc200";
import VOIIcon from "static/crypto-icons/voi/0.svg";
import VIAIcon from "static/crypto-icons/voi/6779767.svg";

const NavRoot = styled.nav`
  color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px 0px;
  border-bottom: 1px solid #eaebf0;
  backdrop-filter: blur(32px);
`;

const NavContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 80px;
  @media screen and (min-width: 960px) {
    padding: 0px 20px;
  }
`;

const NavLogo = styled.img``;

const NavLinks = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: none;
  align-items: center;
  gap: 24px;
  @media screen and (min-width: 960px) {
    display: inline-flex;
  }
`;

const NavLink = styled.a`
  font-family: Nohemi, sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
  letter-spacing: 0.1px;
  text-align: left;
  text-decoration: none;
  color: #161717;
  cursor: pointer;
  &:hover {
    color: #9933ff !important;
  }
  text-align: center;
  padding-left: 6px;
  padding-right: 6px;
`;

const ActiveNavLink = styled(NavLink)`
  color: #9933ff;
  border-bottom: 3px solid #9933ff;
`;

const LgIconLink = styled.a`
  display: none;
  cursor: pointer;
  &:hover {
    color: #9933ff;
  }
  @media screen and (min-width: 600px) {
    display: inline-flex;
  }
`;

const ConnectButton = styled.svg`
  cursor: pointer;
`;

const Navbar = () => {
  /* Copy to clipboard */

  const [copiedText, copy] = useCopyToClipboard();

  const handleCopy = (text: string) => () => {
    copy(text)
      .then(() => {
        console.log("Copied!", { text });
        toast.success("Copied to clipboard!");
      })
      .catch((error) => {
        toast.error("Failed to copy to clipboard!");
      });
  };

  /* Wallet */

  const { providers, activeAccount, connectedAccounts, getAccountInfo } =
    useWallet();

  const [accInfo, setAccInfo] = React.useState<any>(null);
  const [balance, setBalance] = React.useState<any>(null);

  // EFFECT: get voi balance
  useEffect(() => {
    if (activeAccount && providers && providers.length >= 3) {
      getAccountInfo().then(setAccInfo);
    }
  }, [activeAccount, providers]);

  // EFFECT: get voi balance
  useEffect(() => {
    if (activeAccount && providers && providers.length >= 3) {
      const { algodClient, indexerClient } = getAlgorandClients();
      const ci = new arc200(TOKEN_VIA, algodClient, indexerClient);
      ci.arc200_balanceOf(activeAccount.address).then(
        (arc200_balanceOfR: any) => {
          if (arc200_balanceOfR.success) {
            setBalance(Number(arc200_balanceOfR.returnValue));
          }
        }
      );
    }
  }, [activeAccount, providers]);

  console.log({ accInfo, balance });

  /* Theme */

  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );

  /* Navigation */

  const navigate = useNavigate();
  const [active, setActive] = React.useState("");

  /* Popper */

  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen((previousOpen) => !previousOpen);
  };

  const canBeOpen = open && Boolean(anchorEl);
  const id = canBeOpen ? "transition-popper" : undefined;

  return (
    <NavRoot
      style={{
        backgroundColor: isDarkTheme ? "#161717" : undefined,
        borderBottom: isDarkTheme ? "none" : undefined,
      }}
    >
      <NavContainer>
        <Link to="/">
          <NavLogo src={isDarkTheme ? DarkLogo : LightLogo} />
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <NavLinks>
            {[
              {
                label: "Collections",
                href: "/collection",
              },
              /*
              {
                label: "Auction",
                href: "/auctions",
              },
              {
                label: "Buy",

                href: "/listings",
              },
              {
                label: "Sell",
                href: "/profile",
              },
              {
                label: "Activity",
                href: "/activity",
              },
              */
            ].map((item) =>
              active === item.label ? (
                <ActiveNavLink
                  onClick={() => {
                    navigate(item.href);
                    setActive(item.label);
                  }}
                >
                  {item.label}
                </ActiveNavLink>
              ) : (
                <NavLink
                  style={{ color: isDarkTheme ? "#717579" : undefined }}
                  onClick={() => {
                    navigate(item.href);
                    setActive(item.label);
                  }}
                >
                  {item.label}
                </NavLink>
              )
            )}
          </NavLinks>
          <ul
            style={{
              listStyleType: "none",
              margin: 0,
              padding: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: "24px",
            }}
          >
            {/* magnifying glass */}
            {/*<li style={{ color: isDarkTheme ? "#717579" : undefined }}>
              <LgIconLink>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </LgIconLink>
          </li>*/}
            {/* moon icon */}
            <li style={{ color: isDarkTheme ? "#717579" : undefined }}>
              <ThemeSelector>
                {isDarkTheme ? (
                  <WbSunnyOutlinedIcon />
                ) : (
                  <LgIconLink>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22 15.8442C20.6866 16.4382 19.2286 16.7688 17.6935 16.7688C11.9153 16.7688 7.23116 12.0847 7.23116 6.30654C7.23116 4.77135 7.5618 3.3134 8.15577 2C4.52576 3.64163 2 7.2947 2 11.5377C2 17.3159 6.68414 22 12.4623 22C16.7053 22 20.3584 19.4742 22 15.8442Z"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </LgIconLink>
                )}
              </ThemeSelector>
            </li>
            {/*<li style={{ color: isDarkTheme ? "#717579" : undefined }}>
              <LgIconLink>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 2H3.30616C3.55218 2 3.67519 2 3.77418 2.04524C3.86142 2.08511 3.93535 2.14922 3.98715 2.22995C4.04593 2.32154 4.06333 2.44332 4.09812 2.68686L4.57143 6M4.57143 6L5.62332 13.7314C5.75681 14.7125 5.82355 15.2031 6.0581 15.5723C6.26478 15.8977 6.56108 16.1564 6.91135 16.3174C7.30886 16.5 7.80394 16.5 8.79411 16.5H17.352C18.2945 16.5 18.7658 16.5 19.151 16.3304C19.4905 16.1809 19.7818 15.9398 19.9923 15.6342C20.2309 15.2876 20.3191 14.8247 20.4955 13.8988L21.8191 6.94969C21.8812 6.62381 21.9122 6.46087 21.8672 6.3335C21.8278 6.22177 21.7499 6.12768 21.6475 6.06802C21.5308 6 21.365 6 21.0332 6H4.57143ZM10 21C10 21.5523 9.55228 22 9 22C8.44772 22 8 21.5523 8 21C8 20.4477 8.44772 20 9 20C9.55228 20 10 20.4477 10 21ZM18 21C18 21.5523 17.5523 22 17 22C16.4477 22 16 21.5523 16 21C16 20.4477 16.4477 20 17 20C17.5523 20 18 20.4477 18 21Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </LgIconLink>
        </li>*/}
          </ul>
          {activeAccount ? (
            <AccountCircleOutlinedIcon
              sx={{
                color: isDarkTheme ? "rgb(113, 117, 121)" : undefined,
                cursor: "pointer",
                display: { xs: "none", md: "block" },
              }}
              onClick={() => {
                const addrs = Array.from(
                  new Set(connectedAccounts.map((a) => a.address))
                );
                navigate(`/account/${addrs.join(",")}`);
              }}
            />
          ) : null}
          {!activeAccount ? (
            <div onClick={handleClick}>
              {isDarkTheme ? (
                <svg
                  width="159"
                  height="50"
                  viewBox="0 0 159 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g filter="url(#filter0_d_423_14448)">
                    <rect
                      x="3"
                      y="2"
                      width="153"
                      height="44"
                      rx="22"
                      fill="#9933FF"
                    />
                    <rect
                      x="3"
                      y="2"
                      width="153"
                      height="44"
                      rx="22"
                      stroke="#9933FF"
                    />
                    <path
                      d="M25.976 22.28C25.976 24.724 27.072 26.072 28.992 26.072C30.524 26.072 31.464 25.172 31.768 23.4H34.28C33.848 26.412 31.856 28.24 28.988 28.24C25.728 28.24 23.432 25.872 23.432 22.28C23.432 18.688 25.728 16.32 28.988 16.32C31.856 16.32 33.848 18.148 34.28 21.16H31.768C31.464 19.384 30.524 18.488 28.992 18.488C27.072 18.488 25.976 19.836 25.976 22.28ZM35.0624 23.588C35.0624 20.772 36.8984 18.94 39.5344 18.94C42.1704 18.94 44.0064 20.772 44.0064 23.588C44.0064 26.404 42.1704 28.24 39.5344 28.24C36.8984 28.24 35.0624 26.404 35.0624 23.588ZM37.4744 23.588C37.4744 25.22 38.2384 26.152 39.5344 26.152C40.8344 26.152 41.5944 25.224 41.5944 23.588C41.5944 21.952 40.8344 21.028 39.5344 21.028C38.2384 21.028 37.4744 21.956 37.4744 23.588ZM47.2361 23.372V28H44.8401V19.18H47.2361V21.832C47.6081 19.964 48.7001 18.94 50.3361 18.94C52.2361 18.94 53.2641 20.328 53.2641 22.876V28H50.8681V23.276C50.8681 21.772 50.3041 21.028 49.1561 21.028C47.9321 21.028 47.2361 21.856 47.2361 23.372ZM56.6424 23.372V28H54.2464V19.18H56.6424V21.832C57.0144 19.964 58.1064 18.94 59.7424 18.94C61.6424 18.94 62.6704 20.328 62.6704 22.876V28H60.2744V23.276C60.2744 21.772 59.7104 21.028 58.5624 21.028C57.3384 21.028 56.6424 21.856 56.6424 23.372ZM69.9046 25.012H72.1566C71.6766 27.02 70.0686 28.24 67.9246 28.24C65.2646 28.24 63.4686 26.36 63.4686 23.58C63.4686 20.808 65.2446 18.94 67.8766 18.94C70.4846 18.94 72.1966 20.772 72.1966 23.568C72.1966 23.78 72.1886 23.996 72.1646 24.22H65.7806C65.9366 25.54 66.7446 26.324 67.9926 26.324C68.9246 26.324 69.5566 25.884 69.9046 25.012ZM65.8086 22.74H69.8966C69.6966 21.48 69.0086 20.824 67.8886 20.824C66.7406 20.824 66.0006 21.52 65.8086 22.74ZM75.2713 23.588C75.2713 25.22 76.0353 26.152 77.3353 26.152C78.4273 26.152 78.9953 25.472 79.1753 24.516H81.5673C81.2913 26.7 79.6913 28.24 77.3313 28.24C74.6953 28.24 72.8593 26.404 72.8593 23.588C72.8593 20.772 74.6953 18.94 77.3313 18.94C79.6913 18.94 81.2913 20.48 81.5673 22.664H79.1793C78.9953 21.704 78.4273 21.028 77.3353 21.028C76.0353 21.028 75.2713 21.956 75.2713 23.588ZM88.0405 27.932C87.2965 28.136 86.6405 28.236 86.0645 28.236C84.1245 28.236 83.1085 27.088 83.1085 24.844V21.084H82.0045V19.18H83.1085V17.148H85.5045V19.18H88.0405V21.084H85.5045V24.848C85.5045 25.86 85.8605 26.308 86.6765 26.308C87.0045 26.308 87.4405 26.236 88.0405 26.084V27.932Z"
                      fill="white"
                    />
                    <rect
                      x="118"
                      y="8"
                      width="32"
                      height="32"
                      rx="16"
                      fill="#99FF33"
                    />
                    <path
                      d="M137 25.3333H137.007M128 19.3333V28.6667C128 29.403 128.597 30 129.333 30H138.667C139.403 30 140 29.403 140 28.6667V22C140 21.2636 139.403 20.6667 138.667 20.6667L129.333 20.6667C128.597 20.6667 128 20.0697 128 19.3333ZM128 19.3333C128 18.597 128.597 18 129.333 18H137.333M137.333 25.3333C137.333 25.5174 137.184 25.6667 137 25.6667C136.816 25.6667 136.667 25.5174 136.667 25.3333C136.667 25.1492 136.816 25 137 25C137.184 25 137.333 25.1492 137.333 25.3333Z"
                      stroke="black"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </g>
                  <defs>
                    <filter
                      id="filter0_d_423_14448"
                      x="0.5"
                      y="0.5"
                      width="158"
                      height="49"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dy="1" />
                      <feGaussianBlur stdDeviation="1" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.04 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="BackgroundImageFix"
                        result="effect1_dropShadow_423_14448"
                      />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_dropShadow_423_14448"
                        result="shape"
                      />
                    </filter>
                  </defs>
                </svg>
              ) : (
                <svg
                  width="159"
                  height="50"
                  viewBox="0 0 159 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g filter="url(#filter0_d_494_16539)">
                    <rect
                      x="3"
                      y="2"
                      width="153"
                      height="44"
                      rx="22"
                      stroke="#9933FF"
                      shape-rendering="crispEdges"
                    />
                    <path
                      d="M25.976 22.28C25.976 24.724 27.072 26.072 28.992 26.072C30.524 26.072 31.464 25.172 31.768 23.4H34.28C33.848 26.412 31.856 28.24 28.988 28.24C25.728 28.24 23.432 25.872 23.432 22.28C23.432 18.688 25.728 16.32 28.988 16.32C31.856 16.32 33.848 18.148 34.28 21.16H31.768C31.464 19.384 30.524 18.488 28.992 18.488C27.072 18.488 25.976 19.836 25.976 22.28ZM35.0624 23.588C35.0624 20.772 36.8984 18.94 39.5344 18.94C42.1704 18.94 44.0064 20.772 44.0064 23.588C44.0064 26.404 42.1704 28.24 39.5344 28.24C36.8984 28.24 35.0624 26.404 35.0624 23.588ZM37.4744 23.588C37.4744 25.22 38.2384 26.152 39.5344 26.152C40.8344 26.152 41.5944 25.224 41.5944 23.588C41.5944 21.952 40.8344 21.028 39.5344 21.028C38.2384 21.028 37.4744 21.956 37.4744 23.588ZM47.2361 23.372V28H44.8401V19.18H47.2361V21.832C47.6081 19.964 48.7001 18.94 50.3361 18.94C52.2361 18.94 53.2641 20.328 53.2641 22.876V28H50.8681V23.276C50.8681 21.772 50.3041 21.028 49.1561 21.028C47.9321 21.028 47.2361 21.856 47.2361 23.372ZM56.6424 23.372V28H54.2464V19.18H56.6424V21.832C57.0144 19.964 58.1064 18.94 59.7424 18.94C61.6424 18.94 62.6704 20.328 62.6704 22.876V28H60.2744V23.276C60.2744 21.772 59.7104 21.028 58.5624 21.028C57.3384 21.028 56.6424 21.856 56.6424 23.372ZM69.9046 25.012H72.1566C71.6766 27.02 70.0686 28.24 67.9246 28.24C65.2646 28.24 63.4686 26.36 63.4686 23.58C63.4686 20.808 65.2446 18.94 67.8766 18.94C70.4846 18.94 72.1966 20.772 72.1966 23.568C72.1966 23.78 72.1886 23.996 72.1646 24.22H65.7806C65.9366 25.54 66.7446 26.324 67.9926 26.324C68.9246 26.324 69.5566 25.884 69.9046 25.012ZM65.8086 22.74H69.8966C69.6966 21.48 69.0086 20.824 67.8886 20.824C66.7406 20.824 66.0006 21.52 65.8086 22.74ZM75.2713 23.588C75.2713 25.22 76.0353 26.152 77.3353 26.152C78.4273 26.152 78.9953 25.472 79.1753 24.516H81.5673C81.2913 26.7 79.6913 28.24 77.3313 28.24C74.6953 28.24 72.8593 26.404 72.8593 23.588C72.8593 20.772 74.6953 18.94 77.3313 18.94C79.6913 18.94 81.2913 20.48 81.5673 22.664H79.1793C78.9953 21.704 78.4273 21.028 77.3353 21.028C76.0353 21.028 75.2713 21.956 75.2713 23.588ZM88.0405 27.932C87.2965 28.136 86.6405 28.236 86.0645 28.236C84.1245 28.236 83.1085 27.088 83.1085 24.844V21.084H82.0045V19.18H83.1085V17.148H85.5045V19.18H88.0405V21.084H85.5045V24.848C85.5045 25.86 85.8605 26.308 86.6765 26.308C87.0045 26.308 87.4405 26.236 88.0405 26.084V27.932Z"
                      fill="#9933FF"
                    />
                    <rect
                      x="118"
                      y="8"
                      width="32"
                      height="32"
                      rx="16"
                      fill="#99FF33"
                    />
                    <path
                      d="M137 25.3333H137.007M128 19.3333V28.6667C128 29.403 128.597 30 129.333 30H138.667C139.403 30 140 29.403 140 28.6667V22C140 21.2636 139.403 20.6667 138.667 20.6667L129.333 20.6667C128.597 20.6667 128 20.0697 128 19.3333ZM128 19.3333C128 18.597 128.597 18 129.333 18H137.333M137.333 25.3333C137.333 25.5174 137.184 25.6667 137 25.6667C136.816 25.6667 136.667 25.5174 136.667 25.3333C136.667 25.1492 136.816 25 137 25C137.184 25 137.333 25.1492 137.333 25.3333Z"
                      stroke="#161717"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </g>
                  <defs>
                    <filter
                      id="filter0_d_494_16539"
                      x="0.5"
                      y="0.5"
                      width="158"
                      height="49"
                      filterUnits="userSpaceOnUse"
                      color-interpolation-filters="sRGB"
                    >
                      <feFlood flood-opacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dy="1" />
                      <feGaussianBlur stdDeviation="1" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.04 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="BackgroundImageFix"
                        result="effect1_dropShadow_494_16539"
                      />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_dropShadow_494_16539"
                        result="shape"
                      />
                    </filter>
                  </defs>
                </svg>
              )}
            </div>
          ) : (
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              {accInfo ? (
                <>
                  <div
                    style={{
                      color: isDarkTheme ? "#717579" : undefined,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        display: { xs: "none", sm: "flex" },
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <img src={VOIIcon} style={{ height: "12px" }} />
                        <div>
                          {(
                            (accInfo.amount - accInfo["min-balance"]) /
                            1e6
                          ).toLocaleString()}{" "}
                          VOI
                        </div>
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <img src={VIAIcon} style={{ height: "12px" }} />
                        <div>{(balance / 1e6).toLocaleString()} VIA</div>
                      </Stack>
                    </Stack>
                  </div>
                  {/*<Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      backgroundColor: isDarkTheme ? "#717579" : undefined,
                    }}
                  />*/}
                  <div
                    style={{
                      color: isDarkTheme ? "#717579" : undefined,
                    }}
                  >
                    {activeAccount.address.slice(0, 4)}
                  </div>
                </>
              ) : null}
              <div
                onClick={handleClick}
                style={{
                  cursor: "pointer",
                }}
              >
                {activeAccount ? (
                  <img
                    style={{
                      height: "29px",
                      width: "29px",
                      borderRadius: "29px",
                    }}
                    src={
                      providers?.find(
                        (el) => el.metadata.id === activeAccount.providerId
                      )?.metadata.icon
                    }
                  />
                ) : null}
                {/*<AccountBalanceWalletOutlinedIcon
                  sx={{
                    color: isDarkTheme ? "#717579" : undefined,
                  }}
                />*/}
              </div>
            </Stack>
          )}
          <Popper
            sx={{
              zIndex: 2000,
            }}
            id={id}
            open={open}
            anchorEl={anchorEl}
            transition
            placement="bottom-start"
          >
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={350}>
                <Box
                  sx={{
                    width: "300px",
                    border: 1,
                    p: 1,
                    bgcolor: "background.paper",
                  }}
                >
                  {providers ? (
                    <Stack spacing={2}>
                      {providers.map((provider) => (
                        <Stack spacing={2}>
                          {!connectedAccounts
                            .map(({ providerId }) => providerId)
                            .includes(provider.metadata.id) ? (
                            <button
                              onClick={() => {
                                provider.connect();
                                setOpen(false);
                              }}
                            >
                              {provider.metadata.name}
                            </button>
                          ) : (
                            <Stack
                              spacing={2}
                              direction="row"
                              style={{ justifyContent: "space-between" }}
                            >
                              <u>{provider.metadata.name}</u>
                              <button
                                onClick={() => {
                                  provider.disconnect();
                                }}
                              >
                                Disconnect
                              </button>
                            </Stack>
                          )}
                          {connectedAccounts
                            ?.filter(
                              (account) =>
                                account?.providerId === provider.metadata.id
                            )
                            ?.map((account) => {
                              const isAccountActive =
                                activeAccount?.providerId ===
                                  provider.metadata.id &&
                                activeAccount?.address === account?.address;
                              return (
                                <Stack spacing={2} direction="row">
                                  <span
                                    style={{
                                      fontWeight: isAccountActive
                                        ? "bold"
                                        : "normal",
                                    }}
                                  >
                                    {account?.address?.slice(0, 4)}
                                  </span>
                                  <button
                                    onClick={handleCopy(account?.address)}
                                  >
                                    Copy
                                  </button>
                                  <button
                                    onClick={() => {
                                      navigate(`/account/${account?.address}`);
                                    }}
                                  >
                                    View
                                  </button>
                                  {!isAccountActive ? (
                                    <button
                                      onClick={() => {
                                        provider.setActiveProvider();
                                        provider.setActiveAccount(
                                          account?.address
                                        );
                                      }}
                                    >
                                      Set Active
                                    </button>
                                  ) : (
                                    <em>Active</em>
                                  )}
                                </Stack>
                              );
                            })}
                        </Stack>
                      ))}
                    </Stack>
                  ) : null}
                </Box>
              </Fade>
            )}
          </Popper>
        </div>
      </NavContainer>
    </NavRoot>
  );
};

export default Navbar;
