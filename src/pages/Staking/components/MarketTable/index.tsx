import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  Button,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Pagination from "@/components/Pagination";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { toast } from "react-toastify";
import VIAIcon from "/src/static/crypto-icons/voi/6779767.svg";
import moment from "moment";
import { Link } from "react-router-dom";
import BuySaleModal from "@/components/modals/BuySaleModal2";

interface MarketTableProps {
  marketData: any[]; // Replace 'any' with a more specific type if available
}

const MarketTable: React.FC<MarketTableProps> = ({ marketData }) => {
  const { isDarkTheme } = useSelector((state: RootState) => state.theme);
  const theme = useTheme();
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tableStyle = {
    backgroundColor: "transparent",
    borderRadius: "8px",
    marginTop: "25px",
  };

  const cellStyle = {
    color: isDarkTheme ? "white" : theme.palette.text.primary,
    fontWeight: 100,
  };

  const headCellStyle = {
    ...cellStyle,
    backgroundColor: isDarkTheme
      ? theme.palette.grey[800]
      : theme.palette.grey[200],
    fontWeight: 900,
  };

  const headRowStyle = {
    borderBottom: "none",
  };

  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(marketData.length / itemsPerPage);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`${label} copied to clipboard`))
      .catch(() => toast.error("Failed to copy to clipboard"));
  };

  console.log({ marketData });

  const handleOpenModal = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  return (
    <>
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
              <TableCell style={headCellStyle} align="right">
                Total Staked
              </TableCell>
              <TableCell style={headCellStyle} align="right">
                Lockup
              </TableCell>
              <TableCell style={headCellStyle} align="right">
                Vesting
              </TableCell>
              <TableCell style={headCellStyle} align="right">
                Unlock
              </TableCell>
              {/*
              <TableCell style={headCellStyle} align="right">
                Discount
              </TableCell>
              */}
              <TableCell style={headCellStyle} align="right">
                Price
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {marketData
              .slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
              )
              .map((item, index) => (
                <TableRow key={item.contractId}>
                  <TableCell style={cellStyle} align="center">
                    <Link
                      to={`/collection/${item.token.contractId}/token/${item.token.tokenId}`}
                    >
                      {item.token.contractId}
                    </Link>
                    <ContentCopyIcon
                      style={{
                        cursor: "pointer",
                        marginLeft: "5px",
                        fontSize: "16px",
                        color: "inherit",
                      }}
                      onClick={() =>
                        copyToClipboard(
                          item.token.contractId,
                          "Account Address"
                        )
                      }
                    />
                  </TableCell>
                  <TableCell style={cellStyle} align="center">
                    <a
                      href={`https://block.voi.network/explorer/account/${item.contractAddress}/transactions`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit" }}
                    >
                      {item.contractAddress.slice(0, 10)}...
                      {item.contractAddress.slice(-10)}
                    </a>
                    <ContentCopyIcon
                      style={{
                        cursor: "pointer",
                        marginLeft: "5px",
                        fontSize: "16px",
                        color: "inherit",
                      }}
                      onClick={() =>
                        copyToClipboard(item.contractAddress, "Account Address")
                      }
                    />
                  </TableCell>
                  <TableCell style={cellStyle} align="right">
                    {item.totalStaked / 1e6} VOI
                  </TableCell>
                  <TableCell style={cellStyle} align="right">
                    {item.lockup}
                  </TableCell>
                  <TableCell style={cellStyle} align="right">
                    {item.vesting}
                  </TableCell>
                  <TableCell style={cellStyle} align="right">
                    {moment.unix(item.unlock).fromNow()}
                  </TableCell>
                  {/*<TableCell style={cellStyle} align="right">
                    {item.discount}%
                  </TableCell>*/}
                  <TableCell style={cellStyle} align="right">
                    <Button
                      sx={{
                        borderRadius: "20px",
                        color: "inherit",
                      }}
                      variant={isDarkTheme ? "outlined" : "contained"}
                      size="small"
                      onClick={() => handleOpenModal(item)}
                    >
                      <img
                        src={VIAIcon}
                        style={{ height: "12px" }}
                        alt="VOI Icon"
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          ml: 1,
                          color: "white",
                          fontWeight: 500,
                        }}
                      >
                        {item.price / 1e6} VOI
                      </Typography>
                    </Button>
                  </TableCell>
                </TableRow>
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
      {selectedItem && (
        <BuySaleModal
          open={isModalOpen}
          onClose={handleCloseModal}
          item={selectedItem}
        />
      )}
    </>
  );
};

export default MarketTable;
