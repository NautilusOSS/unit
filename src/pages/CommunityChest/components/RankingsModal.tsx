import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
} from '@mui/material';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { toast } from 'react-toastify';

const StyledDialog = styled(Dialog)<{ $isDarkTheme: boolean }>`
  .MuiDialog-paper {
    background-color: ${props => props.$isDarkTheme ? 'rgb(23, 23, 23)' : 'rgb(255, 255, 255)'};
    color: ${props => props.$isDarkTheme ? '#fff' : '#000'};
    border-radius: 24px;
    padding: 16px;
    border: 1px solid ${props => props.$isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  }
`;

const StyledTableContainer = styled(TableContainer)<{ $isDarkTheme: boolean }>`
  background-color: transparent !important;
  
  .MuiTableCell-root {
    color: ${props => props.$isDarkTheme ? '#fff' : '#000'};
    border-bottom: 1px solid ${props => props.$isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  }

  .MuiTableHead-root .MuiTableCell-root {
    color: ${props => props.$isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
    font-weight: 600;
  }
`;

interface RankingsModalProps {
  open: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
  holders: Array<{
    accountId: string;
    balance: string;
  }>;
  totalSupply: string;
}

const RankingsModal: React.FC<RankingsModalProps> = ({
  open,
  onClose,
  isDarkTheme,
  holders,
  totalSupply,
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Address copied to clipboard'))
      .catch(() => toast.error('Failed to copy address'));
  };

  const formatBalance = (balance: string): string => {
    return new BigNumber(balance).dividedBy(1e6).toFormat();
  };

  const calculatePercentage = (balance: string): string => {
    return new BigNumber(balance)
      .dividedBy(totalSupply)
      .multipliedBy(100)
      .toFormat(2);
  };

  // Sort holders by balance
  const sortedHolders = [...holders].sort((a, b) => 
    new BigNumber(b.balance).minus(new BigNumber(a.balance)).toNumber()
  );

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      $isDarkTheme={isDarkTheme}
    >
      <DialogTitle>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Holder Rankings
        </Typography>
      </DialogTitle>
      <DialogContent>
        <StyledTableContainer component={Paper} $isDarkTheme={isDarkTheme}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="right">Balance</TableCell>
                <TableCell align="right">Share</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedHolders.map((holder, index) => (
                <TableRow key={holder.accountId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Link
                        href={`https://voi.observer/explorer/account/${holder.accountId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ 
                          color: isDarkTheme ? '#90caf9' : '#1976d2',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {`${holder.accountId.slice(0, 6)}...${holder.accountId.slice(-6)}`}
                      </Link>
                      <ContentCopyIcon
                        sx={{
                          cursor: 'pointer',
                          fontSize: '16px',
                          color: isDarkTheme ? '#90caf9' : '#1976d2',
                          '&:hover': { opacity: 0.8 }
                        }}
                        onClick={() => copyToClipboard(holder.accountId)}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right">{formatBalance(holder.balance)} VOI</TableCell>
                  <TableCell align="right">{calculatePercentage(holder.balance)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
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

export default RankingsModal; 