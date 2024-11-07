import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Tabs,
  Tab,
  Box,
  useTheme,
  styled,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import PositionTokenRow from "../PositionTokenRow";
import PositionRow from "../PositionRow";
import Pagination from "@/components/Pagination";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

interface ResponsiveTableProps {
  stakingContracts: any[];
  arc72Tokens: any[];
}

type SortDirection = "asc" | "desc" | null;
type SortColumn = "contractId" | "totalStaked" | "unlock" | "claimable" | null;

const StyledTabs = styled(Tabs)<{ $isDarkTheme: boolean }>`
  .MuiTab-root {
    color: ${props => props.$isDarkTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
    font-family: "Plus Jakarta Sans";
    font-weight: 600;
    
    &.Mui-selected {
      color: #9933ff;
    }
  }

  .MuiTabs-indicator {
    background-color: #9933ff;
  }
`;

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  stakingContracts,
  arc72Tokens,
}) => {
  const { isDarkTheme } = useSelector((state: RootState) => state.theme);
  const theme = useTheme();
  const pageSize = 10;

  // Add sorting state
  const [sortColumn, setSortColumn] = useState<SortColumn>("totalStaked");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Sort stakingContracts
  const sortedStakingContracts = useMemo(() => {
    if (!sortColumn || !sortDirection) return stakingContracts;

    return [...stakingContracts].sort((a, b) => {
      let aValue: any = a[sortColumn];
      let bValue: any = b[sortColumn];

      // Special handling for specific columns
      if (sortColumn === "totalStaked") {
        aValue = Number(a.global_total || 0);
        bValue = Number(b.global_total || 0);
      } else if (sortColumn === "unlock") {
        aValue = Number(a.unlock || 0);
        bValue = Number(b.unlock || 0);
      } else if (sortColumn === "claimable") {
        aValue = Number(a.withdrawable || 0);
        bValue = Number(b.withdrawable || 0);
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return bValue > aValue ? 1 : -1;
      }
    });
  }, [stakingContracts, sortColumn, sortDirection]);

  // Sort arc72Tokens
  const sortedArc72Tokens = useMemo(() => {
    if (!sortColumn || !sortDirection) return arc72Tokens;

    return [...arc72Tokens].sort((a, b) => {
      let aValue: any = a[sortColumn];
      let bValue: any = b[sortColumn];

      // Special handling for specific columns
      if (sortColumn === "totalStaked") {
        aValue = Number(a.staking?.global_total || 0);
        bValue = Number(b.staking?.global_total || 0);
      } else if (sortColumn === "unlock") {
        aValue = Number(a.staking?.unlock || 0);
        bValue = Number(b.staking?.unlock || 0);
      } else if (sortColumn === "claimable") {
        aValue = Number(a.staking?.withdrawable || 0);
        bValue = Number(b.staking?.withdrawable || 0);
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return bValue > aValue ? 1 : -1;
      }
    });
  }, [arc72Tokens, sortColumn, sortDirection]);

  const SortableHeader: React.FC<{
    column: SortColumn;
    children: React.ReactNode;
  }> = ({ column, children }) => (
    <Box
      component="span"
      sx={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        "&:hover": { opacity: 0.8 },
      }}
      onClick={() => handleSort(column)}
    >
      {children}
      {sortColumn === column && (
        <Box component="span" sx={{ ml: 1 }}>
          {sortDirection === "asc" ? (
            <ArrowUpwardIcon fontSize="small" />
          ) : (
            <ArrowDownwardIcon fontSize="small" />
          )}
        </Box>
      )}
    </Box>
  );

  console.log(stakingContracts, arc72Tokens);

  const tableStyle = {
    backgroundColor: "transparent",
    borderRadius: "8px",
    marginTop: "25px",
  };

  const cellStyle = {
    color: theme.palette.mode === "dark" ? "white" : theme.palette.text.primary,
    fontWeight: 900,
  };

  const headCellStyle = {
    ...cellStyle,
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[200],
  };

  const headRowStyle = {
    borderBottom: "none",
  };

  const lastRowStyle = {
    borderBottom: "none",
  };

  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const totalPages = Math.ceil(sortedStakingContracts.length / pageSize);
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages2 = Math.ceil(sortedArc72Tokens.length / pageSize);
  const [currentPage2, setCurrentPage2] = React.useState(1);

  return (
    <>
      <StyledTabs 
        value={value} 
        onChange={handleChange} 
        aria-label="position tabs"
        $isDarkTheme={isDarkTheme}
      >
        <Tab label="Staking Contracts" />
        <Tab label="Tokens" />
      </StyledTabs>
      <CustomTabPanel value={value} index={0}>
        <TableContainer component={Paper} style={tableStyle}>
          <Table>
            <TableHead>
              <TableRow style={headRowStyle}>
                <TableCell style={headCellStyle} align="right">
                  <SortableHeader column="contractId">
                    Account Id
                  </SortableHeader>
                </TableCell>
                <TableCell style={headCellStyle} align="center">
                  Account Address
                </TableCell>
                <TableCell style={headCellStyle} align="center">
                  Delegate
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  <SortableHeader column="totalStaked">
                    Lockup Tokens
                  </SortableHeader>
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  <SortableHeader column="unlock">Unlock Time</SortableHeader>
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  <SortableHeader column="claimable">Claimable</SortableHeader>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedStakingContracts
                ?.slice((currentPage - 1) * pageSize, currentPage * pageSize)
                ?.map((ctc, index) => (
                  <PositionRow
                    key={ctc.contractId}
                    position={ctc}
                    cellStyle={cellStyle}
                  />
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          isDarkTheme={isDarkTheme}
        />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <TableContainer component={Paper} style={tableStyle}>
          <Table>
            <TableHead>
              <TableRow style={headRowStyle}>
                <TableCell style={headCellStyle} align="right">
                  <SortableHeader column="contractId">
                    Account Id
                  </SortableHeader>
                </TableCell>
                <TableCell style={headCellStyle} align="center">
                  Account Address
                </TableCell>
                <TableCell style={headCellStyle} align="center">
                  Delegate
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  <SortableHeader column="totalStaked">
                    Lockup Tokens
                  </SortableHeader>
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  <SortableHeader column="unlock">Unlock Time</SortableHeader>
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  <SortableHeader column="claimable">Claimable</SortableHeader>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedArc72Tokens
                ?.slice((currentPage2 - 1) * pageSize, currentPage2 * pageSize)
                ?.map((nft, index) => (
                  <PositionTokenRow
                    key={nft.tokenId}
                    nft={nft}
                    index={index}
                    arc72TokensLength={sortedArc72Tokens.length}
                    lastRowStyle={lastRowStyle}
                    cellStyle={cellStyle}
                  />
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          currentPage={currentPage2}
          totalPages={totalPages2}
          onPageChange={setCurrentPage2}
          isDarkTheme={isDarkTheme}
        />
      </CustomTabPanel>
    </>
  );
};

export default ResponsiveTable;
