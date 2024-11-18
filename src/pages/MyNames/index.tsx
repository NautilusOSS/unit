import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Paper, List, ListItem, ListItemText, Button, Alert } from '@mui/material';
import { useWallet } from '@txnlab/use-wallet-react';

const MyNames: React.FC = () => {
  const [names, setNames] = useState<string[]>([]);
  const { activeAccount } = useWallet();

  useEffect(() => {
    if (activeAccount) {
      // TODO: Fetch names owned by the connected wallet
      // This will use the VNS contract to get names
    }
  }, [activeAccount]);

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My VOI Names
        </Typography>

        {!activeAccount ? (
          <Alert severity="warning">
            Please connect your wallet to view your names
          </Alert>
        ) : (
          <Paper sx={{ p: 3 }}>
            {names.length === 0 ? (
              <Typography>You don't own any names yet</Typography>
            ) : (
              <List>
                {names.map((name, index) => (
                  <ListItem 
                    key={index}
                    secondaryAction={
                      <Button variant="outlined" size="small">
                        Manage
                      </Button>
                    }
                  >
                    <ListItemText primary={name} />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default MyNames; 