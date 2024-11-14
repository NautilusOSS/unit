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

interface RewardDistributionModalProps {
  open: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
}

const RewardDistributionModal: React.FC<RewardDistributionModalProps> = ({
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
        <Typography variant="h6" component="div" sx={{ fontWeight: 600, textAlign: 'center' }}>
          Block Reward Distribution
        </Typography>
      </DialogTitle>
      <DialogContent>
        {/* SVG Diagram */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <svg width="380" height="240" viewBox="0 0 380 240">
            {/* Background Circle */}
            <circle 
              cx="190" 
              cy="120" 
              r="100"
              fill="none" 
              stroke={isDarkTheme ? "#ffffff33" : "#00000033"} 
              strokeWidth="2"
            />
            
            {/* 45% LP Incentives Slice */}
            <path
              d="M190,120 L190,20 A100,100 0 0,1 276.5,175 L190,120"
              fill={isDarkTheme ? "#90caf9" : "#1976d2"}
              opacity="0.8"
            />
            <text x="250" y="80" fill={isDarkTheme ? "#fff" : "#000"} fontSize="14">
              45% LP Incentives
            </text>
            
            {/* 45% Roll Them Dice Slice */}
            <path
              d="M190,120 L276.5,175 A100,100 0 0,1 103.5,175 L190,120"
              fill={isDarkTheme ? "#64b5f6" : "#1565c0"}
              opacity="0.8"
            />
            <text x="190" y="200" fill={isDarkTheme ? "#fff" : "#000"} fontSize="14" textAnchor="middle">
              45% Roll Them Dice
            </text>
            
            {/* 10% Node Operator Slice */}
            <path
              d="M190,120 L103.5,175 A100,100 0 0,1 190,20 L190,120"
              fill={isDarkTheme ? "#42a5f5" : "#0d47a1"}
              opacity="0.8"
            />
            <text x="90" y="80" fill={isDarkTheme ? "#fff" : "#000"} fontSize="14" textAnchor="end">
              10% Node Operator
            </text>
          </svg>
        </Box>

        {/* Additional Information */}
        <Typography variant="body2" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
          How it works:
        </Typography>
        <Typography variant="body2" sx={{ mb: 1.5, pl: 2 }}>
          • 45% goes to LP incentives, redistributed back to the chest in future epochs
        </Typography>
        <Typography variant="body2" sx={{ mb: 1.5, pl: 2 }}>
          • 45% goes to the Roll Them Dice winner
        </Typography>
        <Typography variant="body2" sx={{ pl: 2 }}>
          • 10% goes to operator of the node
        </Typography>
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

export default RewardDistributionModal; 