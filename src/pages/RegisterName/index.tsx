import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, Paper, Alert } from '@mui/material';
import { useWallet } from '@txnlab/use-wallet-react';

const RegisterName: React.FC = () => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('1');
  const { activeAccount } = useWallet();

  const handleRegister = async () => {
    // TODO: Implement name registration logic using VNS contract
    console.log('Registering:', name, 'for', duration, 'years');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Register VOI Name
        </Typography>

        {!activeAccount && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please connect your wallet to register a name
          </Alert>
        )}
        
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name to register"
            />
            
            <TextField
              label="Duration (years)"
              type="number"
              variant="outlined"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              inputProps={{ min: "1", max: "10" }}
            />

            <Button 
              variant="contained" 
              onClick={handleRegister}
              disabled={!activeAccount}
            >
              Register
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterName; 