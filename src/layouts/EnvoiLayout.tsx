import React, { useState } from "react";
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  useTheme,
  Menu,
  MenuItem,
} from "@mui/material";
import { useWallet } from "@txnlab/use-wallet-react";
import { Link, useLocation } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  currentPath: string;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, currentPath }) => {
  const theme = useTheme();
  const isActive = currentPath === to;

  return (
    <Button
      component={Link}
      to={to}
      sx={{
        color: isActive ? "#8B5CF6" : "inherit",
        textDecoration: "none",
        mx: 1,
        fontWeight: isActive ? 600 : 400,
        "&:hover": {
          color: "#A78BFA",
          backgroundColor: "transparent",
        },
        "&:after": {
          content: '""',
          position: "absolute",
          width: isActive ? "100%" : "0%",
          height: "2px",
          bottom: "0",
          left: "0",
          backgroundColor: "#8B5CF6",
          transition: "width 0.2s ease-in-out",
        },
        position: "relative",
        padding: "6px 8px",
      }}
    >
      {children}
    </Button>
  );
};

interface EnvoiLayoutProps {
  children: React.ReactNode;
}

const purpleButtonStyles = {
  backgroundColor: "#8B5CF6",
  color: "white",
  "&:hover": {
    backgroundColor: "#7C3AED",
  },
  borderRadius: "100px",
  padding: "10px 24px",
  fontSize: "1rem",
  textTransform: "none",
  height: "48px",
  minWidth: "180px",
};

const purpleOutlinedStyles = {
  color: "#8B5CF6",
  borderColor: "#8B5CF6",
  "&:hover": {
    borderColor: "#7C3AED",
    backgroundColor: "rgba(139, 92, 246, 0.04)",
  },
  borderRadius: "100px",
  padding: "10px 24px",
  fontSize: "1rem",
  textTransform: "none",
  height: "48px",
  minWidth: "180px",
};

const EnvoiLayout: React.FC<EnvoiLayoutProps> = ({ children }) => {
  const { activeAccount, activeAddress, wallets } = useWallet();
  const location = useLocation();
  const theme = useTheme();

  // Add state for menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleConnect = () => {
    const kibisis = wallets?.find((w) => w.id === "kibisis");
    if (kibisis) {
      kibisis.connect();
    }
  };

  const handleDisconnect = () => {
    const kibisis = wallets?.find((w) => w.id === "kibisis");
    if (kibisis) {
      kibisis.disconnect();
    }
    handleClose();
  };

  return (
    <Box sx={{ 
      height: '100vh', // Full viewport height
      display: 'flex',
      flexDirection: 'column',
      bgcolor: "background.default" 
    }}>
      <AppBar
        sx={{ mt: 2 }}
        position="static"
        color="transparent"
        elevation={0}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="h6"
                component={Link}
                to="/"
                sx={{
                  textDecoration: "none",
                  color: "inherit",
                  mr: 4,
                  fontWeight: "bold",
                  "& .voi-text": {
                    color: "#8B5CF6", // Purple color for VOI
                    fontWeight: 600,
                  },
                }}
              >
                En<span className="voi-text">voi</span>
              </Typography>

              <Box sx={{ display: "flex" }}>
                <NavLink to="/search" currentPath={location.pathname}>
                  Search
                </NavLink>
                <NavLink to="/register" currentPath={location.pathname}>
                  Register
                </NavLink>
                <NavLink to="/my-names" currentPath={location.pathname}>
                  My Names
                </NavLink>
              </Box>
            </Box>

            <Box>
              {activeAccount ? (
                <>
                  <Button
                    variant="outlined"
                    onClick={handleClick}
                    endIcon={
                      <KeyboardArrowDownIcon sx={{ color: "#8B5CF6" }} />
                    }
                    sx={purpleOutlinedStyles}
                  >
                    {activeAddress?.slice(0, 4)}...{activeAddress?.slice(-4)}
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                      "aria-labelledby": "wallet-button",
                    }}
                  >
                    <MenuItem
                      onClick={handleDisconnect}
                      sx={{
                        "&:hover": {
                          color: "#8B5CF6",
                        },
                      }}
                    >
                      Disconnect
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleConnect}
                  sx={purpleButtonStyles}
                >
                  Connect Wallet
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          overflow: 'hidden', // Prevent scrolling
          position: 'relative'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default EnvoiLayout;
