import React from "react";
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
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import PositionTokenRow from "../PositionTokenRow";
import PositionRow from "../PositionRow";
import Pagination from "@/components/Pagination";
import party from "party-js";

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

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  stakingContracts,
  arc72Tokens,
}) => {
  const { isDarkTheme } = useSelector((state: RootState) => state.theme);
  const theme = useTheme();

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

  const totalPages = Math.ceil(stakingContracts.length / 5);
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages2 = Math.ceil(arc72Tokens.length / 5);
  const [currentPage2, setCurrentPage2] = React.useState(1);

  return (
    <>
      <Tabs value={value} onChange={handleChange} aria-label="position tabs">
        <Tab label="Staking Contracts" sx={{ color: cellStyle.color }} />
        <Tab label="Tokens" sx={{ color: cellStyle.color }} />
      </Tabs>
      <CustomTabPanel value={value} index={0}>
        <TableContainer component={Paper} style={tableStyle}>
          <Table>
            <TableHead>
              <TableRow style={headRowStyle}>
                <TableCell style={headCellStyle} align="right">
                  Account Id
                </TableCell>
                <TableCell style={headCellStyle} align="center">
                  Account Address
                </TableCell>
                <TableCell style={headCellStyle} align="center">
                  Delegate
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  Lockup Tokens
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  Unlock Time
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  Claimable
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stakingContracts
                ?.slice((currentPage - 1) * 5, currentPage * 5)
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
                  Account Id
                </TableCell>
                <TableCell style={headCellStyle} align="center">
                  Account Address
                </TableCell>
                <TableCell style={headCellStyle} align="center">
                  Delegate
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  Lockup Tokens
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  Unlock Time
                </TableCell>
                <TableCell style={headCellStyle} align="right">
                  Claimable
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {arc72Tokens
                ?.slice((currentPage2 - 1) * 5, currentPage2 * 5)
                ?.map((nft, index) => (
                  <PositionTokenRow
                    key={nft.tokenId}
                    nft={nft}
                    index={index}
                    arc72TokensLength={arc72Tokens.length}
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
