import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { useWallet } from '@txnlab/use-wallet-react';
import { useTheme } from '../../contexts/ThemeContext';

const Wallet: React.FC = () => {
  const { activeAccount, activeWallet, wallets } = useWallet();
  const { isDarkMode } = useTheme();

  const handleConnect = async () => {
    if (wallets && wallets.length > 0) {
      await wallets[0].connect();
    }
  };

  const handleDisconnect = async () => {
    if (activeWallet) {
      await activeWallet.disconnect();
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h2" component="h1" align="center" gutterBottom>
          Wallet
        </Typography>
        {!activeWallet ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={handleConnect}
              sx={{ 
                py: 2,
                px: 4,
                fontSize: '1.2rem'
              }}
            >
              Connect Wallet
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography 
              variant="h6" 
              gutterBottom
              align="left"
              sx={{ 
                color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'text.primary'
              }}
            >
              Connected account
            </Typography>
            <Typography 
              variant="h5" 
              align="left"
              sx={{ 
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                mb: 4,
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
              }}
            >
              {activeAccount?.address}
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDisconnect}
              sx={{ 
                py: 1.5,
                px: 3
              }}
            >
              Disconnect
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Wallet; 