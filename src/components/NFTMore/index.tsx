import React from "react";
import { Grid, Skeleton, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import styled from "styled-components";
import { decodePrice, decodeTokenId } from "../../utils/mp";
import NftCard from "../../components/NFTCard";

const Heading = styled.h3`
  font-family: Advent Pro;
  font-size: 36px;
  font-weight: 700;
  line-height: 40px;
  letter-spacing: 0em;
  text-align: left;
  margin: 0px;
`;

interface NFTMoreProps {
  nfts: any[];
  title: string;
  onClick: (el: any) => void;
}

export const NFTMore: React.FC<NFTMoreProps> = ({ nfts, title, onClick }) => {
  /* Theme */
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );

  const isLoading = false;

  return !isLoading && nfts.length > 0 ? (
    <Stack style={{ gap: "36px" }}>
      <Heading style={{ color: isDarkTheme ? "#FFFFFF" : undefined }}>
        {title}
      </Heading>
      <Grid container spacing={2}>
        {nfts.map((el: any) => {
          return (
            <Grid key={`${el.tokenId}`} item xs={6} sm={4} md={3}>
              <NftCard
                nftName={el.metadata.name}
                image={el.metadata.image}
                price={(el.listing.price / 1e6).toLocaleString()}
                currency={`${el.listing.currency}` === "0" ? "VOI" : "VIA"}
                owner={el.owner}
                onClick={() => {
                  onClick(el);
                }}
              />
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  ) : null;
};
