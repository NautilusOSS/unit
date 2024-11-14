import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import styled from 'styled-components';

const StyledDialog = styled(Dialog)<{ $isDarkTheme: boolean }>`
  .MuiDialog-paper {
    background-color: ${props => props.$isDarkTheme ? 'rgb(23, 23, 23)' : 'rgb(255, 255, 255)'};
    color: ${props => props.$isDarkTheme ? '#fff' : '#000'};
    border-radius: 24px;
    padding: 16px;
    border: 1px solid ${props => props.$isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  }
`;

const Section = styled(Box)<{ $isDarkTheme: boolean }>`
  margin-bottom: 24px;
  
  h6 {
    color: ${props => props.$isDarkTheme ? '#90caf9' : '#1976d2'};
    margin-bottom: 8px;
    font-weight: 600;
  }
  
  p {
    color: ${props => props.$isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
    margin-bottom: 16px;
    line-height: 1.6;
  }
`;

interface HowItWorksModalProps {
  open: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
}

const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  open,
  onClose,
  isDarkTheme,
}) => {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      $isDarkTheme={isDarkTheme}
    >
      <DialogTitle>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          How It Works
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Section $isDarkTheme={isDarkTheme}>
          <Typography variant="h6">Deposits</Typography>
          <Typography>
            Deposit any amount of VOI into the Community Chest. Your deposit is securely stored in the smart contract 
            and can be withdrawn at any time. Each deposit increases your share in the chest.
          </Typography>
        </Section>

        <Section $isDarkTheme={isDarkTheme}>
          <Typography variant="h6">Weekly Draws</Typography>
          <Typography>
            Every week, a random draw selects winners from the pool of participants. Your chances of winning are 
            proportional to your share in the chest. The more you deposit, the better your chances!
          </Typography>
        </Section>

        <Section $isDarkTheme={isDarkTheme}>
          <Typography variant="h6">Withdrawals</Typography>
          <Typography>
            You can withdraw your full deposit at any time. There are no lockup periods or restrictions. 
            Your funds remain yours while participating in the weekly draws.
          </Typography>
        </Section>

        <Section $isDarkTheme={isDarkTheme}>
          <Typography variant="h6">Smart Contract Security</Typography>
          <Typography>
            The Community Chest is powered by a secure, audited smart contract on the VOI blockchain. 
            All transactions are transparent and verifiable on-chain.
          </Typography>
        </Section>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          sx={{
            color: isDarkTheme ? '#90caf9' : '#1976d2',
          }}
        >
          Close
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default HowItWorksModal; 