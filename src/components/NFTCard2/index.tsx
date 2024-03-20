import React from "react";
import styled from "styled-components";
import { Avatar, Tooltip } from "@mui/material";
import { stringToColorCode } from "../../utils/string";
import VoiIcon from "../../static/crypto-icons/voi/0.svg";
import ViaIcon from "../../static/crypto-icons/voi/6779767.svg";
import { Link } from "react-router-dom";
import LazyLoad from "react-lazy-load";

const NFTCardRoot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  border-radius: var(--Main-System-20px, 20px);
  background: var(
    --astronaut2,
    linear-gradient(90deg, #6468af 0%, #0a1d57 100%)
  );
  /*
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.55);
  */
  cursor: pointer;
  width: 305px;
  &.size-small {
    width: 240px;
  }
`;

const NFTCardImageWrapper = styled.div`
  align-self: stretch;
  border-radius: var(--Main-System-20px, 20px) var(--Main-System-20px, 20px) 0px
    0px;
  height: 305px;
  &.size-small {
    height: 240px;
  }
`;

const NFTCardImage = styled.div`
  flex-shrink: 0;
  border-radius: var(--Main-System-20px, 20px) var(--Main-System-20px, 20px) 0px
    0px;
  width: 305px;
  height: 305px;
  &.size-small {
    width: 240px;
    height: 240px;
  }
`;

const NFTInfoWrapper = styled.div`
  display: flex;
  padding: var(--Main-System-20px, 20px) 30px 25px 30px;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;
  border-radius: 0px 0px 16px 16px;
  background: rgba(32, 32, 32, 0.4);
  backdrop-filter: blur(100px);
`;

const NFTArtistInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  align-self: stretch;
`;

const NFTArtistInfo = styled.div`
  align-self: stretch;
  color: var(--White, #fff);
  leading-trim: both;
  text-edge: cap;
  font-feature-settings: "clig" off, "liga" off;
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 800;
  line-height: 24px; /* 120% */
`;

const NFTAdditionalInfo = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  align-self: stretch;
`;

const NFTPriceWrapper = styled.div`
  display: flex;
  padding-right: 21px;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--Main-System-8px, 8px);
  flex: 1 0 0;
`;

const NFTPriceLabel = styled.div`
  align-self: stretch;
  color: #fff;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 110%; /* 15.4px */
`;

const NFTPriceValueWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  align-self: stretch;
`;

const NFTPriceValue = styled.div`
  flex: 1 0 0;
  color: var(--White, #fff);
  font-family: Nohemi;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 140%; /* 22.4px */
`;

export interface NFTCardProps {
  nftName: string;
  image: string;
  price: string;
  currency: string;
  onClick: any;
  style?: any;
  size?: string;
}

const NFTCard: React.FC<NFTCardProps> = ({
  nftName,
  image,
  price,
  currency,
  onClick,
  style = {},
  size = "large",
}) => {
  return (
    <LazyLoad
      height={size === "large" ? 320 * 2 : 370}
      width={size === "large" ? 320 : 240}
    >
      <NFTCardRoot
        className={`size-${size}`}
        onClick={onClick}
        style={{
          ...style,
          background: `url(${image}) lightgray 50% / cover no-repeat`,
        }}
      >
        <NFTCardImageWrapper className={`size-${size}`}>
          <NFTCardImage
            className={`size-${size}`}
            style={{
              background: `url(${image}) lightgray 50% / cover no-repeat`,
            }}
          />
        </NFTCardImageWrapper>
        <NFTInfoWrapper>
          <NFTArtistInfoWrapper>
            <NFTArtistInfo>{nftName}</NFTArtistInfo>
          </NFTArtistInfoWrapper>
          <NFTAdditionalInfo>
            <NFTPriceWrapper>
              <NFTPriceLabel>Price</NFTPriceLabel>
              <NFTPriceValueWrapper>
                <NFTPriceValue>
                  {/*currency === "VOI" ? (
                  <Tooltip placement="top" title="VOI">
                    <img
                      src={VoiIcon}
                      alt="VOI"
                      style={{
                        height: "20px",
                        width: "20px",
                        position: "relative",
                      }}
                    />
                  </Tooltip>
                ) : null}
                {currency === "VIA" ? (
                  <Tooltip placement="top" title="VIA">
                    <img
                      src={ViaIcon}
                      alt="VIA"
                      style={{
                        height: "20px",
                        width: "20px",
                        position: "relative",
                      }}
                    />
                  </Tooltip>
                    ) : null*/}
                  {price} {currency}
                </NFTPriceValue>
              </NFTPriceValueWrapper>
            </NFTPriceWrapper>
          </NFTAdditionalInfo>
        </NFTInfoWrapper>
      </NFTCardRoot>
    </LazyLoad>
  );
};

export default NFTCard;
