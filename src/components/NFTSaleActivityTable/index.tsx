import React, { useEffect, useMemo } from "react";
import { styled as mstyled } from "@mui/system";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import styled from "styled-components";
import { Box } from "@mui/material";
import {
  CollectionI,
  ListingActivityI,
  ListingI,
  RankingI,
  Sale,
  SaleActivityI,
  SaleI,
  Token,
  TokenType,
} from "../../types";
import { compactAddress } from "../../utils/mp";
import moment from "moment";
import { Link } from "react-router-dom";
import { getSmartTokens } from "../../store/smartTokenSlice";
import { UnknownAction } from "@reduxjs/toolkit";
import { BigNumber } from "bignumber.js";
import CryptoIconPlaceholder from "../CryptoIconPlaceholder";
import { intToColorCode } from "../../utils/string";

const formatter = Intl.NumberFormat("en", { notation: "compact" });

const StyledImage = styled(Box)`
  width: 53px;
  height: 53px;
  flex-shrink: 0;
  border-radius: 8px;
  background-size: cover;
`;

const StyledTableCell = mstyled(TableCell)(({ theme }) => {
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );
  return {
    borderBottom: "none",
    padding: theme.spacing(1),
    color: isDarkTheme ? "#fff" : "#000",
    alignItems: "center",
    textAlign: "center",
    "& a": {
      textDecoration: "none",
      color: "inherit",
    },
  };
});

const StyledTableHeading = mstyled(StyledTableCell)(({ theme }) => {
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );
  return {
    color: isDarkTheme ? "#fff" : "#000",
    textAlign: "center",
    fontFamily: "Nohemi",
    fontSize: "20px",
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: "24px",
  };
});

const StyledTableRow = mstyled(TableRow)(({ theme }) => {
  return {
    borderBottom: "1px solid #3B3B3B",
  };
});

interface Props {
  sales: Sale[];
  listings: ListingI[];
  tokens: Token[];
  collections: CollectionI[];
  activeFilter?: string[];
  limit?: number;
}

const NFTCollectionTable: React.FC<Props> = ({
  sales,
  listings,
  tokens,
  collections,
  activeFilter = ["all"],
  limit = 0,
}) => {
  const dispatch = useDispatch();
  const smartTokens = useSelector((state: any) => state.smartTokens.tokens);
  const smartTokenStatus = useSelector(
    (state: any) => state.smartTokens.status
  );
  useEffect(() => {
    dispatch(getSmartTokens() as unknown as UnknownAction);
  }, [dispatch]);

  const sortedList = useMemo(() => {
    return [
      ...(sales.map((el) => ({ ...el, activity: "sale" })) as SaleActivityI[]),
      ...(listings.map((el) => ({
        ...el,
        activity: "listing",
      })) as ListingActivityI[]),
    ]
      .filter((el) => {
        if (
          activeFilter &&
          activeFilter.length === 1 &&
          activeFilter[0] === "all"
        ) {
          return true;
        } else if (activeFilter && activeFilter.includes(el.activity)) {
          return true;
        }
        return false;
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit > 0 ? limit : sales.length);
  }, [sales, listings, activeFilter, limit]);
  return (
    <TableContainer sx={{ mt: 2 }}>
      <Table aria-label="rankings table">
        <TableHead>
          <StyledTableRow hover={true}>
            <StyledTableCell
              sx={{ display: { xs: "none", md: "table-cell" } }}
            ></StyledTableCell>
            <StyledTableCell></StyledTableCell>
            <StyledTableHeading>Token</StyledTableHeading>
            <StyledTableHeading>Activity</StyledTableHeading>
            <StyledTableHeading>Seller</StyledTableHeading>
            <StyledTableHeading>Buyer</StyledTableHeading>
            <StyledTableHeading>Price</StyledTableHeading>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {sortedList.map((sale, index) => {
            const token =
              tokens.find(
                (token) =>
                  token.tokenId === sale.tokenId &&
                  token.contractId === sale.collectionId
              ) || ({} as Token);
            const collection =
              collections.find(
                (collection) => collection.contractId === sale.collectionId
              ) || ({} as CollectionI);

            const collectionsMissingImage = [35720076];
            const url = !collectionsMissingImage.includes(sale.collectionId)
              ? `https://prod.cdn.highforge.io/i/${encodeURIComponent(
                  token.metadataURI
                )}?w=240`
              : token.metadata.image;
            const currency = smartTokens.find(
              (smartToken: TokenType) =>
                `${smartToken.contractId}` === `${sale.currency}`
            );
            const currencyDecimals =
              currency?.decimals === 0 ? 0 : currency?.decimals || 6;
            const currencySymbol =
              currency?.tokenId === "0" ? "VOI" : currency?.symbol || "VOI";
            const price = formatter.format(
              new BigNumber(sale.price)
                .div(new BigNumber(10).pow(currencyDecimals))
                .toNumber()
            );
            return (
              <StyledTableRow hover={true} key={index}>
                <StyledTableCell
                  sx={{ display: { xs: "none", md: "table-cell" } }}
                >
                  {moment.unix(sale.timestamp).fromNow()}
                </StyledTableCell>
                <StyledTableCell>
                  <Link
                    to={`/collection/${collection.contractId}/token/${token.tokenId}`}
                  >
                    <StyledImage
                      sx={{
                        backgroundImage: `url(${url})`,
                      }}
                    />
                  </Link>
                </StyledTableCell>
                <StyledTableCell>
                  <Link
                    to={`/collection/${collection.contractId}/token/${token.tokenId}`}
                  >
                    {token?.metadata?.name || ""}
                  </Link>
                </StyledTableCell>
                <StyledTableCell>
                  {sale.activity[0].toUpperCase() + sale.activity.slice(1)}
                </StyledTableCell>
                <StyledTableCell>
                  <Link to={`/account/${sale.seller}`}>
                    {compactAddress(sale.seller)}
                  </Link>
                </StyledTableCell>
                <StyledTableCell>
                  {sale.buyer ? (
                    <Link to={`/account/${sale?.buyer}`}>
                      {compactAddress(sale?.buyer)}
                    </Link>
                  ) : (
                    "-"
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <CryptoIconPlaceholder
                      color={intToColorCode(
                        currency?.tokenId === "0"
                          ? 0
                          : currency?.contractId || 0
                      )}
                    />
                    <span>
                      {price} {currencySymbol}
                    </span>
                  </Box>
                </StyledTableCell>
              </StyledTableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default NFTCollectionTable;
