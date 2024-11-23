import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  CircularProgress, 
  Typography, 
  Box 
} from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';

interface TransactionPendingModalProps {
  open: boolean;
  message?: string;
}

const TransactionPendingModal: React.FC<TransactionPendingModalProps> = ({ 
  open, 
  message = 'Transaction in progress...' 
}) => {
  const { isDarkMode } = useTheme();

  return (
    <Dialog
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: isDarkMode ? 'rgb(28, 28, 28)' : 'white',
          color: isDarkMode ? 'white' : 'text.primary',
        }
      }}
    >
      <DialogContent>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 2,
          p: 3 
        }}>
          <CircularProgress />
          <Typography>
            {message}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionPendingModal; 