import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  styled,
  useTheme as useMuiTheme
} from '@mui/material';
import { 
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Home as HomeIcon,
  AccountBalanceWallet as WalletIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

interface UnitLayoutProps {
  children: React.ReactNode;
}

const UnitLayout: React.FC<UnitLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false);
  const muiTheme = useMuiTheme();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Wallet', icon: <WalletIcon />, path: '/wallet' },
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      backgroundColor: isDarkMode ? 'rgb(18, 18, 18)' : 'white',
      color: isDarkMode ? 'white' : 'black'
    }}>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={handleDrawerOpen}
        edge="start"
        sx={{
          position: 'fixed',
          left: 16,
          top: 16,
          ...(open && { display: 'none' }),
          zIndex: muiTheme.zIndex.drawer + 2,
          backgroundColor: isDarkMode ? 'rgb(18, 18, 18)' : 'white',
          color: isDarkMode ? 'white' : 'black',
          '&:hover': {
            backgroundColor: isDarkMode ? 'rgb(28, 28, 28)' : 'rgba(255, 255, 255, 0.9)',
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: isDarkMode ? 'rgb(18, 18, 18)' : 'white',
            color: isDarkMode ? 'white' : 'black',
          },
        }}
        variant="temporary"
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <DrawerHeader>
          <IconButton onClick={toggleTheme} sx={{ color: isDarkMode ? 'white' : 'black' }}>
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <IconButton onClick={handleDrawerClose} sx={{ color: isDarkMode ? 'white' : 'black' }}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>

        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text}
              onClick={() => {
                navigate(item.path);
                handleDrawerClose();
              }}
            >
              <ListItemIcon sx={{ color: isDarkMode ? 'white' : 'black' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: '100vh',
          backgroundColor: isDarkMode ? 'rgb(18, 18, 18)' : 'white',
          color: isDarkMode ? 'white' : 'black',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default UnitLayout; 