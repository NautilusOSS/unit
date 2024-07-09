import React, { useContext, useEffect, useMemo } from "react";
import Layout from "../../layouts/Default";
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Container,
  Grid,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import NFTCard from "../../components/NFTCard";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import axios from "axios";
import { stringToColorCode } from "../../utils/string";
import styled from "styled-components";
import FireplaceIcon from "@mui/icons-material/Fireplace";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useCopyToClipboard } from "usehooks-ts";
import { toast } from "react-toastify";
import { custom, useWallet } from "@txnlab/use-wallet";
import SendIcon from "@mui/icons-material/Send";
import { getAlgorandClients } from "../../wallets";
import { arc72, CONTRACT, abi, arc200, swap } from "ulujs";
import TransferModal from "../../components/modals/TransferModal";
import ListSaleModal from "../../components/modals/ListSaleModal";
import ListAuctionModal from "../../components/modals/ListAuctionModal";
import algosdk from "algosdk";
import { ListingBoxCost, ctcInfoMp206 } from "../../contants/mp";
import { decodeRoyalties } from "../../utils/hf";
import NFTListingTable from "../../components/NFTListingTable";
import { ListingI, Token, TokenType } from "../../types";
import ViewListIcon from "@mui/icons-material/ViewList";
import GridViewIcon from "@mui/icons-material/GridView";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { getPrices } from "../../store/dexSlice";
import { UnknownAction } from "@reduxjs/toolkit";
import { CTCINFO_LP_WVOI_VOI } from "../../contants/dex";
import StorefrontIcon from "@mui/icons-material/Storefront";
import GavelIcon from "@mui/icons-material/Gavel";
import { ARC72_INDEXER_API } from "../../config/arc72-idx";
import { QUEST_ACTION, getActions, submitAction } from "../../config/quest";
import { BigNumber } from "bignumber.js";
import { getSmartTokens } from "../../store/smartTokenSlice";

const formatter = Intl.NumberFormat("en", { notation: "compact" });

const { algodClient, indexerClient } = getAlgorandClients();

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AccountLabel = styled.div`
  font-family: Nohemi;
  font-size: 16px;
  font-weight: 500;
  line-height: 36px;
  letter-spacing: 0em;
  text-align: left;
  color: #717579;
`;

const AccountValue = styled.div`
  font-family: Inter;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  letter-spacing: 0px;
  text-align: center;
`;

export const Account: React.FC = () => {
  const dispatch = useDispatch();

  const smartTokens = useSelector((state: any) => state.smartTokens.tokens);
  const smartTokenStatus = useSelector(
    (state: any) => state.smartTokens.status
  );
  useEffect(() => {
    dispatch(getSmartTokens() as unknown as UnknownAction);
  }, [dispatch]);

  /* Dex */
  const prices = useSelector((state: RootState) => state.dex.prices);
  const dexStatus = useSelector((state: RootState) => state.dex.status);
  useEffect(() => {
    dispatch(getPrices() as unknown as UnknownAction);
  }, [dispatch]);
  const exchangeRate = useMemo(() => {
    if (!prices || dexStatus !== "succeeded") return 0;
    const voiPrice = prices.find((p) => p.contractId === CTCINFO_LP_WVOI_VOI);
    if (!voiPrice) return 0;
    return voiPrice.rate;
  }, [prices, dexStatus]);

  /* Router */

  const { id } = useParams();
  const navigate = useNavigate();

  const idArr = id?.indexOf(",") !== -1 ? id?.split(",") || [] : [id];

  /* Selection */
  const [selected, setSelected] = React.useState(-1);
  const [selected2, setSelected2] = React.useState<string>("");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  /* Wallet */
  const {
    activeAccount,
    providers,
    connectedAccounts,
    signTransactions,
    sendTransactions,
  } = useWallet();

  /* Copy to clipboard */

  const [copiedText, copy] = useCopyToClipboard();

  const handleCopy = (text: string) => () => {
    copy(text)
      .then(() => {
        toast.success("Copied to clipboard!");
      })
      .catch((error) => {
        toast.error("Failed to copy to clipboard!");
      });
  };

  /* Theme */

  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );

  /* NFT Navigator Listings */
  const [listings, setListings] = React.useState<any>(null);
  React.useEffect(() => {
    try {
      const res = axios
        .get(`${ARC72_INDEXER_API}/nft-indexer/v1/mp/listings`, {
          params: {
            active: true,
            seller: idArr,
          },
        })
        .then(({ data }) => {
          setListings(data.listings);
        });
    } catch (e) {
      console.log(e);
    }
  }, []);

  const normalListings = useMemo(() => {
    if (!listings || !exchangeRate) return [];
    return listings.map((listing: ListingI) => {
      return {
        ...listing,
        normalPrice:
          listing.currency === 0 ? listing.price : listing.price * exchangeRate,
      };
    });
  }, [listings, exchangeRate]);

  /* NFT Navigator Collections */
  const [collections, setCollections] = React.useState<any>(null);
  React.useEffect(() => {
    try {
      (async () => {
        const {
          data: { collections: res },
        } = await axios.get(`${ARC72_INDEXER_API}/nft-indexer/v1/collections`);
        const collections = [];
        for (const c of res) {
          const t = c.firstToken;
          if (!!t) {
            const tm = JSON.parse(t.metadata);
            collections.push({
              ...c,
              firstToken: {
                ...t,
                metadata: tm,
              },
            });
          }
        }
        setCollections(collections);
      })();
    } catch (e) {
      console.log(e);
    }
  }, [listings]);

  /* NFT Navigator NFTs */
  const [nfts, setNfts] = React.useState<Token[]>([] as Token[]);
  React.useEffect(() => {
    try {
      (async () => {
        const {
          data: { tokens: res },
        } = await axios.get(`${ARC72_INDEXER_API}/nft-indexer/v1/tokens`, {
          params: {
            owner: idArr,
          },
        });
        const nfts = [];
        for (const t of res) {
          const tm = JSON.parse(t.metadata);
          const royalties = decodeRoyalties(tm.royalties);
          const listing = listings?.find(
            (l: any) =>
              `${l.collectionId}` === `${t.contractId}` &&
              `${l.tokenId}` === `${t.tokenId}`
          );
          nfts.push({
            ...t,
            metadata: tm,
            royalties,
            listing,
          });
        }
        nfts.sort((a, b) => (a.listing?.price && a.listing?.currency ? 1 : -1));

        setNfts(nfts);
      })();
    } catch (e) {
      console.log(e);
    }
  }, [listings]);

  const listedNfts = useMemo(() => {
    const listedNfts =
      nfts
        ?.filter((nft: any) => {
          return listings?.some(
            (listing: any) =>
              `${listing.collectionId}` === `${nft.contractId}` &&
              `${listing.tokenId}` === `${nft.tokenId}`
          );
        })
        ?.map((nft: any) => {
          const listing = listings.find(
            (l: any) =>
              `${l.collectionId}` === `${nft.contractId}` &&
              `${l.tokenId}` === `${nft.tokenId}`
          );
          return {
            ...nft,
            listing,
          };
        }) || [];
    listedNfts.sort(
      (a: any, b: any) => b.listing.collectionId - a.listing.collectionId
    );
    return listedNfts;
  }, [nfts, listings]);

  const listedCollections = useMemo(() => {
    const listedCollections =
      collections
        ?.filter((c: any) => {
          return listedNfts?.some(
            (nft: any) => `${nft.contractId}` === `${c.contractId}`
          );
        })
        ?.map((c: any) => {
          return {
            ...c,
            tokens: listedNfts?.filter(
              (nft: any) => `${nft.contractId}` === `${c.contractId}`
            ),
          };
        }) || [];
    listedCollections.sort(
      (a: any, b: any) =>
        b.tokens[0].listing.createTimestamp -
        a.tokens[0].listing.createTimestamp
    );
    return listedCollections;
  }, [collections, listedNfts]);

  const isLoading = useMemo(
    () =>
      !collections || !nfts || !listings || !listedNfts || !listedCollections,
    [collections, nfts, listings, listedNfts, listedCollections]
  );

  /* Transaction */

  const [open, setOpen] = React.useState(false);
  const [isTransferring, setIsTransferring] = React.useState(false);
  const [openListSale, setOpenListSale] = React.useState(false);
  const [openListAuction, setOpenListAuction] = React.useState(false);
  const [isListing, setIsListing] = React.useState(false);

  const [activeTab, setActiveTab] = React.useState(0);

  const [nft, setNft] = React.useState<any>(null);
  useEffect(() => {
    if (selected === -1) return;
    const nft: Token = nfts[selected];
    const royalties = decodeRoyalties(nft.metadata.royalties);
    setNft({
      ...nft,
      royalties,
    });
  }, [nfts, selected]);

  const handleListAuction = async (price: string, currency: string) => {};

  const handleListSale = async (
    price: string,
    currency: string,
    token: TokenType
  ) => {
    if (!activeAccount) return;

    console.log({ nft, price, currency, token });

    const { algodClient, indexerClient } = getAlgorandClients();

    const priceN = Number(price);
    const priceBi = BigInt(
      new BigNumber(price)
        .multipliedBy(new BigNumber(10).pow(token.decimals))
        .toFixed(0)
    );

    const currencyN = Number(currency); // not sure if we still use this

    const listedNft = nft?.listing
      ? nft
      : listedNfts.find(
          (el: any) =>
            el.contractId === nfts[selected].contractId &&
            el.tokenId === nfts[selected].tokenId
        );

    console.log({ priceN, currencyN, activeAccount, listedNft });

    const contractId = nft?.contractId || 0;
    const tokenId = nft?.tokenId || 0;

    try {
      const zeroAddress =
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";
      const manager =
        "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ";
      const CTC_INFO_ARC200LT_NAUT_VOI = 57771072;
      const CTC_INFO_MP206 = 29117863;
      const CTC_INFO_NAUT = 57774022;
      const CTC_INFO_WVOI2 = 34099056;
      const ctcAddr = algosdk.getApplicationAddress(CTC_INFO_MP206);
      const ci = new CONTRACT(
        CTC_INFO_MP206,
        algodClient,
        indexerClient,
        abi.custom,
        {
          addr: activeAccount.address,
          sk: new Uint8Array(0),
        }
      );
      const makePTok = () =>
        new CONTRACT(
          token.contractId === 0 ? Number(token.tokenId) : token.contractId,
          algodClient,
          indexerClient,
          abi.nt200,
          {
            addr: activeAccount.address,
            sk: new Uint8Array(0),
          }
        );
      const builder = {
        tokN: new CONTRACT(
          CTC_INFO_NAUT,
          algodClient,
          indexerClient,
          abi.arc200,
          {
            addr: activeAccount.address,
            sk: new Uint8Array(0),
          },
          true,
          false,
          true
        ),
        tokP: new CONTRACT(
          token.contractId === 0 ? Number(token.tokenId) : token.contractId,
          algodClient,
          indexerClient,
          abi.nt200,
          {
            addr: activeAccount.address,
            sk: new Uint8Array(0),
          },
          true,
          false,
          true
        ),
        arc72: new CONTRACT(
          contractId,
          algodClient,
          indexerClient,
          abi.arc72,
          {
            addr: activeAccount.address,
            sk: new Uint8Array(0),
          },
          true,
          false,
          true
        ),
        mp: new CONTRACT(
          ctcInfoMp206,
          algodClient,
          indexerClient,
          abi.mp,
          {
            addr: activeAccount.address,
            sk: new Uint8Array(0),
          },
          true,
          false,
          true
        ),
      };

      setIsListing(true); // set loading state

      const listedNft = nft?.listing
        ? nft
        : listedNfts.find(
            (el: any) =>
              el.contractId === nfts[selected].contractId &&
              el.tokenId === nfts[selected].tokenId
          );

      const seller = activeAccount.address;
      const royaltyInfo = nft.royalties;
      const createAddr1 = royaltyInfo?.creator1Address || zeroAddress;
      const createAddr2 = royaltyInfo?.creator2Address || zeroAddress;
      const createAddr3 = royaltyInfo?.creator3Address || zeroAddress;

      let ensureMarketplaceBalance = false;
      do {
        const ci = makePTok();
        const res = await ci.arc200_transfer(ctcAddr, 0);
        if (res.success) break;
        ci.setPaymentAmount(28500);
        const res2 = await ci.arc200_transfer(ctcAddr, 0);
        if (res2.success) ensureMarketplaceBalance = true;
      } while (0);
      console.log({ ensureMarketplaceBalance });
      if (ensureMarketplaceBalance) {
        const ci = makePTok();
        ci.setPaymentAmount(28500);
        await toast.promise(
          ci
            .arc200_transfer(ctcAddr, 0)
            .then((res: { txns: string[] }) =>
              (res?.txns || []).map(
                (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
              )
            )
            .then(signTransactions)
            .then(sendTransactions),
          {
            pending: `Transaction pending...`,
          }
        );
      }

      let ensureManagerBalance = false;
      do {
        const ci = makePTok();
        const res = await ci.arc200_transfer(manager, 0);
        if (res.success) break;
        ci.setPaymentAmount(28500);
        const res2 = await ci.arc200_transfer(manager, 0);
        console.log({ res2 });
        if (res2.success) ensureManagerBalance = true;
      } while (0);
      console.log({ ensureManagerBalance });
      if (ensureManagerBalance) {
        const ci = makePTok();
        ci.setPaymentAmount(28500);
        await toast.promise(
          ci
            .arc200_transfer(manager, 0)
            .then((res: { txns: string[] }) =>
              (res?.txns || []).map(
                (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
              )
            )
            .then(signTransactions)
            .then(sendTransactions),
          {
            pending: `Transaction pending...`,
          }
        );
      }

      let ensureSellerBalance = false;
      do {
        const ci = makePTok();
        const res = await ci.arc200_transfer(seller, 0);
        if (res.success) break;
        ci.setPaymentAmount(28500);
        const res2 = await ci.arc200_transfer(seller, 0);
        if (res2.success) ensureSellerBalance = true;
      } while (0);
      console.log({ ensureSellerBalance });
      if (ensureSellerBalance) {
        const ci = makePTok();
        ci.setPaymentAmount(28500);
        await toast.promise(
          ci
            .arc200_transfer(seller, 0)
            .then((res: { txns: string[] }) =>
              (res?.txns || []).map(
                (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
              )
            )
            .then(signTransactions)
            .then(sendTransactions),
          {
            pending: `Transaction pending...`,
          }
        );
      }

      let ensureCreator1Balance = false;
      do {
        if (createAddr1 === zeroAddress) break;
        const ci = makePTok();
        const res = await ci.arc200_transfer(createAddr1, 0);
        if (res.success) break;
        ci.setPaymentAmount(28500);
        const res2 = await ci.arc200_transfer(createAddr1, 0);
        if (res2.success) {
          ensureCreator1Balance = true;
        }
      } while (0);
      console.log({ ensureCreator1Balance });
      if (ensureCreator1Balance) {
        const ci = makePTok();
        ci.setPaymentAmount(28500);
        await toast.promise(
          ci
            .arc200_transfer(createAddr1, 0)
            .then((res: { txns: string[] }) =>
              (res?.txns || []).map(
                (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
              )
            )
            .then(signTransactions)
            .then(sendTransactions),
          {
            pending: `Transaction pending...`,
          }
        );
      }

      let ensureCreator2Balance = false;
      do {
        if (createAddr2 === zeroAddress) break;
        const ci = makePTok();
        const res = await ci.arc200_transfer(createAddr2, 0);
        if (res.success) break;
        ci.setPaymentAmount(28500);
        const res2 = await ci.arc200_transfer(createAddr2, 0);
        if (res2.success) {
          ensureCreator2Balance = true;
        }
      } while (0);
      console.log({ ensureCreator2Balance });
      if (ensureCreator2Balance) {
        const ci = makePTok();
        ci.setPaymentAmount(28500);
        await toast.promise(
          ci
            .arc200_transfer(createAddr2, 0)
            .then((res: { txns: string[] }) =>
              (res?.txns || []).map(
                (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
              )
            )
            .then(signTransactions)
            .then(sendTransactions),
          {
            pending: `Transaction pending...`,
          }
        );
      }

      let ensureCreator3Balance = false;
      do {
        if (createAddr3 === zeroAddress) break;
        const ci = makePTok();
        const res = await ci.arc200_transfer(createAddr3, 0);
        if (res.success) break;
        ci.setPaymentAmount(28500);
        const res2 = await ci.arc200_transfer(createAddr3, 0);
        if (res2.success) {
          ensureCreator3Balance = true;
        }
      } while (0);
      console.log({ ensureCreator3Balance });
      if (ensureCreator3Balance) {
        const ci = makePTok();
        ci.setPaymentAmount(28500);
        await toast.promise(
          ci
            .arc200_transfer(createAddr3, 0)
            .then((res: { txns: string[] }) =>
              (res?.txns || []).map(
                (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
              )
            )
            .then(signTransactions)
            .then(sendTransactions),
          {
            pending: `Transaction pending...`,
          }
        );
      }

      let ensureSellerApproval = false;

      // ------------------------------------------
      // NAUT
      //   swap VOI for 1 NAUT
      //   transfer 1 NAUT to manager
      // WVOI
      //   createBalanceBox for self
      //   if royalty createBalanceBox for creator1
      //   if royalty createBalanceBox for creator2
      //   if royalty createBalanceBox for creator3
      // UPDATE
      //   mp206 delete listing
      // CORE
      //   arc72 approve
      //   mp206 listSC
      // ------------------------------------------
      let customR;
      for (const p1 of [0, 1]) {
        const buildN = [];
        // ----------------------------------------
        // NAUT
        // ----------------------------------------
        do {
          // --------------------------------------
          //   swap VOI for 1 NAUT
          // --------------------------------------
          const poolId = CTC_INFO_ARC200LT_NAUT_VOI;
          const swapR: any = await new swap(
            poolId,
            algodClient,
            indexerClient
          ).swap(
            activeAccount.address,
            poolId,
            {
              amount: "0.1",
              contractId: CTC_INFO_WVOI2,
              tokenId: "0",
              symbol: "VOI",
            },
            {
              contractId: CTC_INFO_NAUT,
              symbol: "NAUT",
              decimals: "18",
            }
          );
          if (!swapR.success) break;
          buildN.push(...swapR.objs);
          // --------------------------------------
          // get txns results from swap
          // --------------------------------------
          const {
            response: { txnGroups },
          } = swapR;
          const [txnGroup] = txnGroups;
          const { txnResults } = txnGroup;
          const [{ txnResult }] = txnResults.slice(-1);
          const { logs } = txnResult;

          const methodSelectorB64 = "FR98dQ==";
          const rLog = logs.find((log: string) => {
            const mSelB64 = Buffer.from(log.slice(0, 4)).toString("base64");
            return mSelB64 === methodSelectorB64;
          });
          const mRVAl1Bi = algosdk.bytesToBigInt(
            Buffer.from(rLog.slice(4, 36))
          );
          const mRVAl2Bi = algosdk.bytesToBigInt(
            Buffer.from(rLog.slice(36, 68))
          );
          const rValBi = mRVAl1Bi === BigInt(0) ? mRVAl2Bi : mRVAl1Bi;
          // --------------------------------------
          //   transfer 1 VOI NAUT to manager
          // --------------------------------------
          const ctcAddr = algosdk.getApplicationAddress(CTC_INFO_MP206);
          const res = await builder.tokN.arc200_transfer(ctcAddr, rValBi);
          buildN.push({
            ...res.obj,
            payment: p1 > 0 ? 28500 : 0,
            note: new TextEncoder().encode(`
            arc200_transfer ${new BigNumber(rValBi.toString())
              .dividedBy(new BigNumber(10).pow(18))
              .toFixed(18)} NAUT from ${activeAccount.address} to ${ctcAddr}
            `),
          });
          // --------------------------------------
        } while (0);
        // ----------------------------------------

        // ----------------------------------------
        // WVOI
        // ----------------------------------------
        //   createBalanceBox for self
        //   if royalty createBalanceBox for creator1
        //   if royalty createBalanceBox for creator2
        //   if royalty createBalanceBox for creator3
        // ----------------------------------------

        // ----------------------------------------
        // UPDATE
        // ----------------------------------------
        if (!!listedNft) {
          // --------------------------------------
          //   mp206 delete listing
          // --------------------------------------
          if (listedNft) {
            const txnO = await builder.mp.a_sale_deleteListing(
              listedNft.listing.mpListingId
            );
            buildN.push({
              ...txnO.obj,
              note: new TextEncoder().encode(`
              a_sale_deleteListing ${listedNft.listing.mpListingId}
              `),
            });
          }
        }

        // ----------------------------------------
        // CORE
        // ----------------------------------------
        do {
          // --------------------------------------
          //   arc72 approve
          // --------------------------------------
          const arc72_approveR = await builder.arc72.arc72_approve(
            algosdk.getApplicationAddress(ctcInfoMp206),
            tokenId
          );
          console.log({ arc72_approveR });
          buildN.push({
            ...arc72_approveR.obj,
            payment: p1 > 0 ? 28500 : 0,
            note: new TextEncoder().encode(`
            arc72_approve ${tokenId} for ${activeAccount.address}
            `),
          });
          // --------------------------------------
          //   mp206 listSC
          // --------------------------------------
          const paymentTokenId =
            token.contractId === 0 ? Number(token.tokenId) : token.contractId;
          const endTime = Number.MAX_SAFE_INTEGER;
          const royalties = Math.min(nft?.royalties?.royaltyPoints || 0, 9500); // RoyaltyPoints
          const createPoints1 = nft?.royalties?.creator1Points || 0; // CreatePoints1
          const createPoints2 = nft?.royalties?.creator2Points || 0; // CreatePoints1
          const createPoints3 = nft?.royalties?.creator3Points || 0; // CreatePoints1
          const createAddr1 =
            nft?.royalties?.creator1Address ||
            "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ"; // CreatePoints1
          const createAddr2 =
            nft?.royalties?.creator2Address ||
            "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ"; // CreatePoints1
          const createAddr3 =
            nft?.royalties?.creator3Address ||
            "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ"; // CreatePoints1
          const a_sale_listSCR = await builder.mp.a_sale_listSC(
            contractId,
            tokenId,
            paymentTokenId,
            priceBi,
            endTime,
            royalties,
            createPoints1,
            createPoints2,
            createPoints3,
            createAddr1,
            createAddr2,
            createAddr3
          );
          console.log({ a_sale_listSCR });
          buildN.push({
            ...a_sale_listSCR.obj,
            payment: ListingBoxCost,
            note: new TextEncoder().encode(`
            a_sale_listSC contractId: nft: ${
              nft.metadata.name
            } listPrice: ${new BigNumber(priceBi.toString()).dividedBy(
              new BigNumber(10).pow(token.decimals).toFixed(token.decimals)
            )} ${token.symbol}  royalties: ${(royalties / 10000) * 100}%
            `),
          });
        } while (0);
        // ----------------------------------------
        ci.setEnableGroupResourceSharing(true);
        ci.setExtraTxns(buildN);
        ci.setFee(4000);
        customR = await ci.custom();
        if (customR.success) break;
      }

      console.log({ customR });

      await signTransactions(
        customR.txns.map(
          (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
        )
      ).then(sendTransactions);

      // ---------------------------------------
      // QUEST HERE
      // list nft for sale
      // ---------------------------------------
      do {
        const address = activeAccount.address;
        const actions: string[] = [
          QUEST_ACTION.SALE_LIST_ONCE,
          QUEST_ACTION.TIMED_SALE_LIST_1MINUTE,
          QUEST_ACTION.TIMED_SALE_LIST_15MINUTES,
          QUEST_ACTION.TIMED_SALE_LIST_1HOUR,
        ];
        const {
          data: { results },
        } = await getActions(address);
        for (const action of actions) {
          const address = activeAccount.address;
          const key = `${action}:${address}`;
          const completedAction = results.find((el: any) => el.key === key);
          if (!completedAction) {
            await submitAction(action, address, {
              contractId,
              tokenId,
            });
          }
          // TODO notify quest completion here
        }
      } while (0);
      // ---------------------------------------

      toast.success("Listing successful"); // show success message

      // ------------------------------------------
    } catch (e: any) {
      toast.error(e.message); // show error message
    } finally {
      setIsListing(false); // reset loading state
      setOpenListSale(false); // close modal
      setSelected(-1); // reset selected
    }

    /*
    const listedNft = nft?.listing
      ? nft
      : listedNfts.find(
          (el: any) =>
            el.contractId === nfts[selected].contractId &&
            el.tokenId === nfts[selected].tokenId
        );

    try {
      if (isNaN(priceN)) {
        throw new Error("Invalid price");
      }
      if (isNaN(currencyN)) {
        throw new Error("Invalid currency");
      }
      if (!activeAccount) {
        throw new Error("No active account");
      }
      setIsListing(true);

      const contractId = nft?.contractId || 0;
      const tokenId = nft?.tokenId || 0;

      if (!contractId || !tokenId) {
        throw new Error("Invalid contractId or tokenId");
      }

      const ciArc72 = new arc72(contractId, algodClient, indexerClient, {
        acc: { addr: activeAccount?.address || "", sk: new Uint8Array(0) },
      });
      const arc72_ownerOfR = await ciArc72.arc72_ownerOf(tokenId);
      if (!arc72_ownerOfR.success) {
        throw new Error("arc72_ownerOf failed in simulate");
      }
      const arc72_ownerOf = arc72_ownerOfR.returnValue;

      const builder = {
        arc200: new CONTRACT(
          currencyN,
          algodClient,
          indexerClient,
          abi.arc200,
          {
            addr: activeAccount?.address || "",
            sk: new Uint8Array(0),
          },
          true,
          false,
          true
        ),
        arc72: new CONTRACT(
          contractId,
          algodClient,
          indexerClient,
          abi.arc72,
          {
            addr: arc72_ownerOf,
            sk: new Uint8Array(0),
          },
          true,
          false,
          true
        ),
        mp: new CONTRACT(
          ctcInfoMp206,
          algodClient,
          indexerClient,
          {
            name: "mp",
            desc: "mp",
            methods: [
              // a_sale_deleteListing(ListingId)
              {
                name: "a_sale_deleteListing",
                args: [
                  {
                    type: "uint256",
                    name: "listingId",
                  },
                ],
                returns: {
                  type: "void",
                },
              },
              // a_sale_listNet(CollectionId, TokenId, ListPrice, EndTime, RoyaltyPoints, CreatePoints1, CreatorPoint2, CreatorPoint3, CreatorAddr1, CreatorAddr2, CreatorAddr3)ListId
              {
                name: "a_sale_listNet",
                args: [
                  {
                    name: "collectionId",
                    type: "uint64",
                  },
                  {
                    name: "tokenId",
                    type: "uint256",
                  },
                  {
                    name: "listPrice",
                    type: "uint64",
                  },
                  {
                    name: "endTime",
                    type: "uint64",
                  },
                  {
                    name: "royalty",
                    type: "uint64",
                  },
                  {
                    name: "createPoints1",
                    type: "uint64",
                  },
                  {
                    name: "creatorPoint2",
                    type: "uint64",
                  },
                  {
                    name: "creatorPoint3",
                    type: "uint64",
                  },
                  {
                    name: "creatorAddr1",
                    type: "address",
                  },
                  {
                    name: "creatorAddr2",
                    type: "address",
                  },
                  {
                    name: "creatorAddr3",
                    type: "address",
                  },
                ],
                returns: {
                  type: "uint256",
                },
              },
              {
                name: "a_sale_listSC",
                args: [
                  {
                    name: "collectionId",
                    type: "uint64",
                  },
                  {
                    name: "tokenId",
                    type: "uint256",
                  },
                  {
                    name: "paymentTokenId",
                    type: "uint64",
                  },
                  {
                    name: "listPrice",
                    type: "uint256",
                  },
                  {
                    name: "endTime",
                    type: "uint64",
                  },
                  {
                    name: "royalty",
                    type: "uint64",
                  },
                  {
                    name: "createPoints1",
                    type: "uint64",
                  },
                  {
                    name: "creatorPoint2",
                    type: "uint64",
                  },
                  {
                    name: "creatorPoint3",
                    type: "uint64",
                  },
                  {
                    name: "creatorAddr1",
                    type: "address",
                  },
                  {
                    name: "creatorAddr2",
                    type: "address",
                  },
                  {
                    name: "creatorAddr3",
                    type: "address",
                  },
                ],
                returns: {
                  type: "uint256",
                },
              },
            ],
            events: [],
          },
          {
            addr: arc72_ownerOf,
            sk: new Uint8Array(0),
          },
          true,
          false,
          true
        ),
      };
      const ciArc200 = new arc200(currencyN, algodClient, indexerClient);
      const ci = new CONTRACT(
        ctcInfoMp206,
        algodClient,
        indexerClient,
        {
          name: "",
          desc: "",
          methods: [
            {
              name: "custom",
              args: [],
              returns: {
                type: "void",
              },
            },
          ],
          events: [],
        },
        {
          addr: arc72_ownerOf,
          sk: new Uint8Array(0),
        }
      );
      // VOI Sale
      if (currencyN === 0) {
        const customPaymentAmount = [ListingBoxCost];
        const buildP = [
          builder.mp.a_sale_listNet(
            contractId, // CollectionId
            tokenId, // TokenId
            priceN * 1e6, // ListPrice
            Number.MAX_SAFE_INTEGER, // EndTime
            Math.min(nft?.royalties?.royaltyPoints || 0, 9500), // RoyaltyPoints
            nft?.royalties?.creator1Points || 0, // CreatePoints1
            nft?.royalties?.creator2Points || 0, // CreatePoints1
            nft?.royalties?.creator3Points || 0, // CreatePoints1
            nft?.royalties?.creator1Address ||
              "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ", // CreatePoints1
            nft?.royalties?.creator2Address ||
              "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ", // CreatePoints1
            nft?.royalties?.creator3Address ||
              "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ" // CreatePoints1
          ),
          builder.arc72.arc72_approve(
            algosdk.getApplicationAddress(ctcInfoMp206), // Address
            tokenId // TokenId
          ),
        ];
        if (listedNft) {
          buildP.push(
            builder.mp.a_sale_deleteListing(listedNft.listing.mpListingId)
          );
        }
        const customTxns = (await Promise.all(buildP)).map(({ obj }) => obj);
        ci.setAccounts([
          "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ", // mp206 D
        ]);
        ci.setFee(2000);
        ci.setPaymentAmount(
          customPaymentAmount.reduce((acc, val) => acc + val, 0)
        );
        ci.setExtraTxns(customTxns);
        ci.setEnableGroupResourceSharing(true);
        // ------------------------------------------
        // eat auto optins
        if (contractId === 29088600) {
          // Cassette
          ci.setOptins([29103397]);
        } else if (contractId === 29085927) {
          // Treehouse
          ci.setOptins([33611293]);
        }
        // ------------------------------------------
        const customR = await ci.custom();

        console.log({ customR });

        if (!customR.success) {
          throw new Error("failed in simulate");
        }
        await signTransactions(
          customR.txns.map(
            (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
          )
        ).then(sendTransactions);
        // ---------------------------------------
        // QUEST HERE
        // voi sale
        // ---------------------------------------
        do {
          const address = activeAccount.address;
          const actions: string[] = [
            QUEST_ACTION.SALE_LIST_ONCE,
            QUEST_ACTION.TIMED_SALE_LIST_1MINUTE,
            QUEST_ACTION.TIMED_SALE_LIST_15MINUTES,
            QUEST_ACTION.TIMED_SALE_LIST_1HOUR,
          ];
          const {
            data: { results },
          } = await getActions(address);
          for (const action of actions) {
            const address = activeAccount.address;
            const key = `${action}:${address}`;
            const completedAction = results.find((el: any) => el.key === key);
            if (!completedAction) {
              await submitAction(action, address, {
                contractId,
                tokenId,
              });
            }
            // TODO notify quest completion here
          }
        } while (0);
        // ---------------------------------------
      }
      // VIA Sale
      else {
        // ------------------------------------------d
        // Setup recipient accounts
        // ------------------------------------------d
        do {
          const ciMp = new CONTRACT(
            ctcInfoMp206,
            algodClient,
            indexerClient,
            {
              name: "",
              desc: "",
              methods: [
                {
                  name: "manager",
                  args: [],
                  returns: {
                    type: "address",
                  },
                },
              ],
              events: [],
            },
            {
              addr: activeAccount?.address || "",
              sk: new Uint8Array(0),
            }
          );
          const ci = new CONTRACT(
            currencyN,
            algodClient,
            indexerClient,
            {
              name: "",
              desc: "",
              methods: [
                {
                  name: "custom",
                  args: [],
                  returns: {
                    type: "void",
                  },
                },
              ],
              events: [],
            },
            {
              addr: arc72_ownerOf,
              sk: new Uint8Array(0),
            }
          );
          const managerR = await ciMp.manager();
          if (!managerR.success) {
            throw new Error("manager failed in simulate");
          }
          const manager = managerR.returnValue;
          const candidates = [
            manager,
            activeAccount?.address || "",
            nft?.royalties?.creator1Address,
            nft?.royalties?.creator2Address,
            nft?.royalties?.creator3Address,
          ];
          const addrs = [];
          for (const addr of candidates) {
            const hasBalanceR = await ciArc200.hasBalance(addr);

            if (!hasBalanceR.success) {
              throw new Error("hasBalance failed in simulate");
            }
            const hasBalance = hasBalanceR.returnValue;
            if (hasBalance === 0) {
              addrs.push(addr);
            }
          }
          const uniqAddrs = Array.from(new Set(addrs));
          if (uniqAddrs.length === 0) {
            break;
          }
          for (let i = 0; i < uniqAddrs.length; i++) {
            const addr = uniqAddrs[i];
            const buildP = [addr].map((addr) =>
              builder.arc200.arc200_transfer(addr, 0)
            );
            const customTxns = (await Promise.all(buildP)).map(
              ({ obj }) => obj
            );
            ci.setFee(1000);
            ci.setPaymentAmount(28500);
            ci.setExtraTxns(customTxns);
            const customR = await ci.custom();

            console.log({ customR });

            if (!customR.success) {
              throw new Error("failed in simulate");
            }
            await toast.promise(
              signTransactions(
                customR.txns.map(
                  (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
                )
              ).then(sendTransactions),
              {
                pending: `Transaction signature pending setup recipient account (${
                  i + 1
                }/${uniqAddrs.length})`,
                success: "Recipient account setup successful",
                error: "Recipient account setup failed",
              }
            );
          }
        } while (0);
        // ------------------------------------------d

        const customPaymentAmount = [ListingBoxCost];
        const buildP = [
          builder.mp.a_sale_listSC(
            contractId,
            tokenId,
            currencyN,
            priceN * 1e6,
            Number.MAX_SAFE_INTEGER,
            Math.min(nft?.royalties?.royaltyPoints || 0, 9500), // RoyaltyPoints
            nft?.royalties?.creator1Points || 0, // CreatePoints1
            nft?.royalties?.creator2Points || 0, // CreatePoints1
            nft?.royalties?.creator3Points || 0, // CreatePoints1
            nft?.royalties?.creator1Address ||
              "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ", // CreatePoints1
            nft?.royalties?.creator2Address ||
              "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ", // CreatePoints1
            nft?.royalties?.creator3Address ||
              "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ" // CreatePoints1
          ),
          builder.arc72.arc72_approve(
            algosdk.getApplicationAddress(ctcInfoMp206),
            tokenId
          ),
        ];
        if (listedNft) {
          buildP.push(
            builder.mp.a_sale_deleteListing(listedNft.listing.mpListingId)
          );
        }
        const customTxns = (await Promise.all(buildP)).map(({ obj }) => obj);
        ci.setAccounts([
          "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ",
        ]);
        ci.setFee(2000);
        ci.setExtraTxns(customTxns);
        if (contractId === 29088600) {
          ci.setOptins([29103397]);
        }
        ci.setPaymentAmount(
          customPaymentAmount.reduce((acc, val) => acc + val, 0)
        );
        // ------------------------------------------
        // eat auto optins
        if (contractId === 29088600) {
          // Cassette
          ci.setOptins([29103397]);
        } else if (contractId === 29085927) {
          // Treehouse
          ci.setOptins([33611293]);
        }
        // ------------------------------------------
        const customR = await ci.custom();

        console.log({ customR });

        if (!customR.success) {
          throw new Error("failed in simulate");
        }
        await toast.promise(
          signTransactions(
            customR.txns.map(
              (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
            )
          ).then(sendTransactions),
          {
            pending: `Transaction signature pending... ${((str) =>
              str[0].toUpperCase() + str.slice(1))(
              activeAccount.providerId
            )} will prompt you to sign the transaction.`,
            success: "List successful!",
            error: "List failed",
          }
        );
        // ---------------------------------------
        // QUEST HERE
        // via sale
        // ---------------------------------------
        // need
        // - address
        // - collection id (contractId)
        // - token id
        // use
        // - sale_list_once
        // - timed_sale_list_1minute
        // - timed_sale_list_15minutes
        // - timed_sale_list_1hour
        // ---------------------------------------
      }
    } catch (e: any) {
      console.log(e);
      toast.error(e.message);
    } finally {
      setIsListing(false);
      setOpenListSale(false);
      setSelected(-1);
    }
    */
  };

  const handleDeleteListing = async (listingId: number) => {
    try {
      const ci = new CONTRACT(
        ctcInfoMp206,
        algodClient,
        indexerClient,
        {
          name: "",
          desc: "",
          methods: [
            {
              name: "a_sale_deleteListing",
              args: [
                {
                  type: "uint256",
                  name: "listingId",
                },
              ],
              returns: {
                type: "void",
              },
            },
          ],
          events: [],
        },
        {
          addr: activeAccount?.address || "",
          sk: new Uint8Array(0),
        }
      );
      ci.setFee(3000);
      const a_sale_deleteListingR = await ci.a_sale_deleteListing(listingId);
      if (!a_sale_deleteListingR.success) {
        throw new Error("a_sale_deleteListing failed in simulate");
      }
      const txns = a_sale_deleteListingR.txns;
      await signTransactions(
        txns.map((txn: string) => new Uint8Array(Buffer.from(txn, "base64")))
      ).then(sendTransactions);
      toast.success("Unlist successful!");
    } catch (e: any) {
      console.log(e);
      toast.error(e.message);
    } finally {
      setSelected2("");
    }
  };

  const handleTransfer = async (addr: string, amount: string) => {
    try {
      const amountN = Number(amount);
      // TODO validate address
      if (!addr) {
        throw new Error("Address is required");
      }
      if (isNaN(amountN)) {
        throw new Error("Invalid amount");
      }
      if (!activeAccount) {
        throw new Error("No active account");
      }
      setIsTransferring(true);
      const nft: any = nfts[selected];

      const currency = smartTokens.find(
        (el: TokenType) => `${el?.contractId}` === `${nft?.listing?.currency}`
      );
      const currencyDecimals =
        currency?.decimals === 0 ? 0 : currency?.decimals || 6;
      const currencySymbol =
        currency?.tokenId === "0" ? "VOI" : currency?.symbol || "VOI";
      const price = formatter.format(
        new BigNumber(nft?.listing?.price)
          .dividedBy(new BigNumber(10).pow(currencyDecimals))
          .toNumber()
      );

      const { contractId, tokenId } = nft;
      const spec = {
        name: "",
        desc: "",
        methods: [
          {
            name: "custom",
            args: [],
            returns: {
              type: "void",
            },
          },
          {
            name: "a_sale_deleteListing",
            args: [
              {
                type: "uint256",
                name: "listingId",
              },
            ],
            returns: {
              type: "void",
            },
          },
        ],
        events: [],
      };
      const ci = new arc72(contractId, algodClient, indexerClient, {
        acc: { addr: activeAccount?.address || "", sk: new Uint8Array(0) },
      });
      const builder: any = {
        arc72: new CONTRACT(
          contractId,
          algodClient,
          indexerClient,
          abi.arc72,
          { addr: activeAccount?.address || "", sk: new Uint8Array(0) },
          undefined,
          undefined,
          true
        ),
        mp: new CONTRACT(
          ctcInfoMp206,
          algodClient,
          indexerClient,
          spec,
          {
            addr: activeAccount?.address || "",
            sk: new Uint8Array(0),
          },
          true,
          false,
          true
        ),
      };
      const arc72_ownerOfR = await ci.arc72_ownerOf(tokenId);
      if (!arc72_ownerOfR.success) {
        throw new Error("arc72_ownerOf failed in simulate");
      }
      const arc72_ownerOf = arc72_ownerOfR.returnValue;
      //if (arc72_ownerOf !== activeAccount?.address) {
      //  throw new Error("arc72_ownerOf not connected");
      //}
      const buildN = [];
      do {
        const txnO = await builder.arc72.arc72_transferFrom(
          activeAccount?.address || "",
          addr,
          BigInt(tokenId)
        );
        buildN.push({
          ...txnO.obj,
          payment: 0,
          note: new TextEncoder().encode(`
          arc72_transferFrom ${nft.metadata.name} from ${activeAccount?.address} to ${addr}
          `),
        });
      } while (0);
      const doDeleteListing =
        nft.listing && nft.listing.seller === activeAccount?.address;
      if (doDeleteListing) {
        const txnO = await builder.mp.a_sale_deleteListing(
          nft.listing.mpListingId
        );
        buildN.push({
          ...txnO.obj,
          payment: 0,
          note: new TextEncoder().encode(`
          a_sale_deleteListing listId: ${nft.listing.mpListingId} listPrice: ${price} ${currencySymbol}
          `),
        });
      }
      const ciCustom = new CONTRACT(
        contractId,
        algodClient,
        indexerClient,
        {
          name: "",
          desc: "",
          methods: [
            {
              name: "custom",
              args: [],
              returns: {
                type: "void",
              },
            },
          ],
          events: [],
        },
        { addr: activeAccount?.address || "", sk: new Uint8Array(0) }
      );
      ciCustom.setExtraTxns(buildN);
      // ------------------------------------------
      // Add payment if necessary
      //   Aust arc72 pays for the box cost if the ctcAddr balance - minBalance < box cost
      const BalanceBoxCost = 28500;
      const accInfo = await algodClient
        .accountInformation(algosdk.getApplicationAddress(contractId))
        .do();
      const availableBalance = accInfo.amount - accInfo["min-balance"];
      const extraPaymentAmount =
        availableBalance < BalanceBoxCost
          ? BalanceBoxCost // Pay whole box cost instead of partial cost, BalanceBoxCost - availableBalance
          : 0;
      ciCustom.setPaymentAmount(extraPaymentAmount);
      const transfers = [];
      if (amountN > 0) {
        transfers.push([Math.floor(amountN * 1e6), addr]);
      }
      ciCustom.setTransfers(transfers);
      // ------------------------------------------
      if (doDeleteListing) {
        ciCustom.setFee(2000);
      }
      ciCustom.setEnableGroupResourceSharing(true);
      const customR = await ciCustom.custom();

      console.log({ customR });

      if (!customR.success) {
        throw new Error("custom failed in simulate");
      }
      const txns = customR.txns;
      const res = await signTransactions(
        txns.map((txn: string) => new Uint8Array(Buffer.from(txn, "base64")))
      ).then(sendTransactions);

      // ---------------------------------------
      // QUEST HERE
      // list nft for sale
      // ---------------------------------------
      do {
        const address = activeAccount.address;
        const actions: string[] = [QUEST_ACTION.NFT_TRANSFER];
        const {
          data: { results },
        } = await getActions(address);
        for (const action of actions) {
          const address = activeAccount.address;
          const key = `${action}:${address}`;
          const completedAction = results.find((el: any) => el.key === key);
          if (!completedAction) {
            await submitAction(action, address, {
              contractId,
            });
          }
          // TODO notify quest completion here
        }
      } while (0);
      // ---------------------------------------

      toast.success(`NFT Transfer successful! Page will reload momentarily.`);
      if (connectedAccounts.map((a) => a.address).includes(addr)) {
        setNfts([
          ...nfts.slice(0, selected),
          { ...nft, owner: addr },
          ...nfts.slice(selected + 1),
        ]);
      } else {
        setNfts([...nfts.slice(0, selected), ...nfts.slice(selected + 1)]);
      }
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    } catch (e: any) {
      console.log(e);
      toast.error(e.message);
    } finally {
      setIsTransferring(false);
      setOpen(false);
      setSelected(-1);
    }
  };

  const handleBurn = async () => {
    try {
      if (!activeAccount) {
        throw new Error("No active account");
      }
      setIsTransferring(true);
      const nft: any = nfts[selected];
      const { contractId, tokenId } = nft;
      const spec = {
        name: "",
        desc: "",
        methods: [
          {
            name: "custom",
            args: [],
            returns: {
              type: "void",
            },
          },
          {
            name: "a_sale_deleteListing",
            args: [
              {
                type: "uint256",
                name: "listingId",
              },
            ],
            returns: {
              type: "void",
            },
          },
        ],
        events: [],
      };
      const ci = new arc72(contractId, algodClient, indexerClient, {
        acc: { addr: activeAccount?.address || "", sk: new Uint8Array(0) },
      });
      const builder: any = {
        arc72: new CONTRACT(
          contractId,
          algodClient,
          indexerClient,
          {
            name: "arc72",
            desc: "arc72",
            methods: [
              {
                name: "burn",
                desc: "Burns the specified NFT",
                args: [
                  {
                    type: "uint256",
                    name: "tokenId",
                    desc: "The ID of the NFT",
                  },
                ],
                returns: { type: "void" },
              },
            ],
            events: [],
          },
          { addr: activeAccount?.address || "", sk: new Uint8Array(0) },
          undefined,
          undefined,
          true
        ),
        mp: new CONTRACT(
          ctcInfoMp206,
          algodClient,
          indexerClient,
          spec,
          {
            addr: activeAccount?.address || "",
            sk: new Uint8Array(0),
          },
          true,
          false,
          true
        ),
      };
      const arc72_ownerOfR = await ci.arc72_ownerOf(tokenId);
      if (!arc72_ownerOfR.success) {
        throw new Error("arc72_ownerOf failed in simulate");
      }
      const arc72_ownerOf = arc72_ownerOfR.returnValue;
      //if (arc72_ownerOf !== activeAccount?.address) {
      //  throw new Error("arc72_ownerOf not connected");
      //}
      const buildN = [];
      buildN.push(builder.arc72.burn(tokenId));
      const doDeleteListing =
        nft.listing && nft.listing.seller === activeAccount?.address;
      if (doDeleteListing) {
        buildN.push(builder.mp.a_sale_deleteListing(nft.listing.mpListingId));
      }
      const buildP = (await Promise.all(buildN)).map(({ obj }) => obj);
      const ciCustom = new CONTRACT(
        contractId,
        algodClient,
        indexerClient,
        {
          name: "",
          desc: "",
          methods: [
            {
              name: "custom",
              args: [],
              returns: {
                type: "void",
              },
            },
          ],
          events: [],
        },
        { addr: activeAccount?.address || "", sk: new Uint8Array(0) }
      );
      ciCustom.setExtraTxns(buildP);
      // ------------------------------------------
      // Add payment if necessary
      //   Aust arc72 pays for the box cost if the ctcAddr balance - minBalance < box cost
      const BalanceBoxCost = 28500;
      const accInfo = await algodClient
        .accountInformation(algosdk.getApplicationAddress(contractId))
        .do();
      const availableBalance = accInfo.amount - accInfo["min-balance"];
      const extraPaymentAmount =
        availableBalance < BalanceBoxCost
          ? BalanceBoxCost // Pay whole box cost instead of partial cost, BalanceBoxCost - availableBalance
          : 0;
      ciCustom.setPaymentAmount(extraPaymentAmount);
      // ------------------------------------------
      if (doDeleteListing) {
        ciCustom.setFee(2000);
      } else {
        ciCustom.setFee(2000);
      }
      const customR = await ciCustom.custom();

      console.log({ customR });

      if (!customR.success) {
        throw new Error("custom failed in simulate");
      }
      const txns = customR.txns;
      const res = await signTransactions(
        txns.map((txn: string) => new Uint8Array(Buffer.from(txn, "base64")))
      ).then(sendTransactions);
      toast.success(`NFT Transfer successful! Page will reload momentarily.`);
      setNfts([...nfts.slice(0, selected), ...nfts.slice(selected + 1)]);
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    } catch (e: any) {
      console.log(e);
      toast.error(e.message);
    } finally {
      setIsTransferring(false);
      setOpen(false);
      setSelected(-1);
    }
  };

  const handleUnlistAll = async () => {
    if (!activeAccount) return;
    try {
      const spec = {
        name: "",
        desc: "",
        methods: [
          {
            name: "custom",
            args: [],
            returns: {
              type: "void",
            },
          },
          {
            name: "a_sale_deleteListing",
            args: [
              {
                type: "uint256",
                name: "listingId",
              },
            ],
            returns: {
              type: "void",
            },
          },
        ],
        events: [],
      };
      const ci = new CONTRACT(ctcInfoMp206, algodClient, indexerClient, spec, {
        addr: activeAccount?.address || "",
        sk: new Uint8Array(0),
      });
      const builder = {
        mp: new CONTRACT(
          ctcInfoMp206,
          algodClient,
          indexerClient,
          spec,
          {
            addr: activeAccount?.address || "",
            sk: new Uint8Array(0),
          },
          true,
          false,
          true
        ),
      };
      const buildN = [];
      for (const nft of listedNfts) {
        buildN.push(builder.mp.a_sale_deleteListing(nft.listing.mpListingId));
      }
      const buildP = (await Promise.all(buildN)).map(({ obj }) => obj);
      console.log(buildP);

      // split into chunks of 12
      const chunkSize = 12;
      const chunks = [];
      for (let i = 0; i < buildP.length; i += chunkSize) {
        chunks.push(buildP.slice(i, i + chunkSize));
      }

      for (const [index, chunk] of Object.entries(chunks)) {
        ci.setFee(2000);
        ci.setEnableGroupResourceSharing(true);
        ci.setExtraTxns(chunk);
        const customR = await ci.custom();

        console.log({ customR });

        await toast.promise(
          signTransactions(
            customR.txns.map(
              (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
            )
          ).then(sendTransactions),
          {
            pending: `Txn pending to delist nfts (${(
              (Number(index) / chunks.length) *
              100
            ).toFixed(2)}%)...`,
            success: "Unlist successful!",
            error: "Unlist failed",
          }
        );
      }
    } catch (e: any) {
      console.log(e);
      toast.error(e.message);
    } finally {
      setSelected2("");
    }
  };

  return !isLoading ? (
    <Layout>
      <Container
        maxWidth="xl"
        sx={{
          color: isDarkTheme ? "#fff" : "#000",
        }}
      >
        <Stack spacing={2} direction="row">
          <Avatar
            sx={{
              background: `linear-gradient(45deg, ${stringToColorCode(
                String(id)
              )}, ${isDarkTheme ? "#000" : "#fff"})`,
              width: "145px",
              height: "145px",
            }}
          >
            {String(id).slice(0, 1)}
          </Avatar>
          <Grid container spacing={2}>
            {id?.split(",")?.map((id) => (
              <Grid item xs={12} key={id}>
                <Stack
                  gap={0.1}
                  sx={{
                    p: 1,
                  }}
                >
                  <AccountLabel>Account</AccountLabel>
                  <Stack direction="row" gap={1}>
                    <AccountValue>
                      {String(id).slice(0, 4)}...{String(id).slice(-4)}
                    </AccountValue>
                    <ContentCopyIcon
                      onClick={() => {
                        handleCopy(String(id))();
                      }}
                    />
                  </Stack>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Stack>
        <ButtonGroup>
          {["Collected", "Listed"].map((el: string, i: number) => (
            <Button
              variant={i === activeTab ? "contained" : "outlined"}
              onClick={() => {
                setActiveTab(i);
              }}
            >
              {el}
            </Button>
          ))}
        </ButtonGroup>
        {activeTab === 1 && idArr.includes(activeAccount?.address || "") ? (
          <Button onClick={handleUnlistAll} color="warning">
            Unlist All
          </Button>
        ) : null}
        {activeTab === 0 && nfts ? (
          <>
            <Typography variant="h4" sx={{ mt: 3 }}>
              Collected <small>{nfts?.length}</small>
            </Typography>
            {nfts ? (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {nfts?.map((nft: any, index: number) => {
                  const pk = `${nft.contractId}-${nft.tokenId}`;

                  console.log({ nft });

                  const currency = smartTokens?.find(
                    (el: TokenType) =>
                      `${el.contractId}` === `${nft?.listing?.currency}`
                  );
                  const currencyDecimals =
                    currency?.decimals === 0 ? 0 : currency?.decimals || 6;
                  const currencySymbol =
                    currency?.tokenId === "0"
                      ? "VOI"
                      : currency?.symbol || "VOI";
                  const price = nft?.listing?.price
                    ? formatter.format(
                        new BigNumber(nft?.listing?.price)
                          .dividedBy(new BigNumber(10).pow(currencyDecimals))
                          .toNumber()
                      )
                    : "";

                  return (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={pk}>
                      {selected >= 0 && selected === index ? (
                        <div
                          style={{
                            position: "relative",
                            zIndex: 2,
                          }}
                        >
                          <ButtonGroup
                            sx={{
                              position: "absolute",
                              top: "-50px",
                              right: "-10px",
                              background: isDarkTheme
                                ? "#000000e0"
                                : "#ffffffe0",
                              backdropFilter: "blur(200px) brightness(100%)",
                            }}
                          >
                            <Button
                              onClick={() => {
                                navigate(
                                  `/collection/${nfts[selected].contractId}/token/${nfts[selected].tokenId}`
                                );
                                window.scrollTo({
                                  top: 0,
                                  behavior: "smooth",
                                });
                              }}
                            >
                              <VisibilityIcon />
                            </Button>
                            <Button
                              size="large"
                              variant="outlined"
                              onClick={async () => {
                                try {
                                  // get account available balance
                                  const accInfo = await algodClient
                                    .accountInformation(
                                      activeAccount?.address || ""
                                    )
                                    .do();
                                  const availableBalance =
                                    accInfo.amount - accInfo["min-balance"];
                                  // check that available balance is greater than or equal to 0.1235
                                  if (availableBalance < 123500) {
                                    throw new Error(
                                      `Insufficient balance (${
                                        (availableBalance - 123500) / 1e6
                                      } VOI). Please fund your account.`
                                    );
                                  }

                                  setOpenListSale(true);
                                } catch (e: any) {
                                  console.log(e);
                                  toast.error(e.message);
                                }
                              }}
                            >
                              <StorefrontIcon />
                            </Button>
                            <Button
                              size="large"
                              variant="outlined"
                              onClick={() => {
                                setOpen(true);
                              }}
                            >
                              <SendIcon />
                            </Button>
                            <Tooltip title="Burn">
                              <Button onClick={() => handleBurn()}>
                                <FireplaceIcon />
                              </Button>
                            </Tooltip>
                          </ButtonGroup>
                        </div>
                      ) : null}
                      <NFTCard
                        nftName={nft.metadata.name}
                        owner=""
                        image={nft.metadata.image}
                        price={price}
                        currency={currencySymbol}
                        onClick={() => {
                          if (idArr.includes(activeAccount?.address || "")) {
                            if (selected === index) {
                              setSelected(-1);
                            } else {
                              setSelected(index);
                            }
                          } else {
                            navigate(
                              `/collection/${nft.contractId}/token/${nft.tokenId}`
                            );
                          }
                        }}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            ) : null}
          </>
        ) : null}
        {activeTab === 1 ? (
          <>
            <Stack
              spacing={2}
              direction="row"
              sx={{ mt: 4, justifyContent: "space-between" }}
            >
              <Typography variant="h4" sx={{ mt: 3 }}>
                Listed <small>{listedNfts.length}</small>
              </Typography>
              <ToggleButtonGroup
                sx={{ display: { xs: "none", sm: "flex" } }}
                color="primary"
                value={viewMode}
                exclusive
                onChange={() => {
                  setViewMode(viewMode === "list" ? "grid" : "list");
                }}
                aria-label="Platform"
              >
                <ToggleButton value="list">
                  <ViewListIcon />
                </ToggleButton>
                <ToggleButton value="grid">
                  <GridViewIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            {viewMode === "list" && nfts && listings && collections ? (
              <Box sx={{ mt: 4 }}>
                <NFTListingTable
                  enableSelect={idArr.includes(activeAccount?.address || "")}
                  onSelect={(x: string) => {
                    if (x === selected2) {
                      setSelected2("");
                    } else {
                      setSelected2(x);
                    }
                  }}
                  selected={selected2}
                  tokens={nfts}
                  listings={normalListings}
                  collections={collections}
                  columns={["image", "token", "price"]}
                />
              </Box>
            ) : null}
            {viewMode == "grid" ? (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {listedNfts?.map((nft: any, index: number) => {
                  const pk = `${nft.listing.mpContractId}-${nft.listing.mpListingId}`;

                  const currency = smartTokens.find(
                    (el: TokenType) =>
                      `${el.contractId}` === `${nft.listing.currency}`
                  );
                  const currencyDecimals =
                    currency?.decimals === 0 ? 0 : currency?.decimals || 6;
                  const currencySymbol =
                    currency?.tokenId === "0"
                      ? "VOI"
                      : currency?.symbol || "VOI";
                  const price = formatter.format(
                    new BigNumber(nft.listing.price)
                      .dividedBy(new BigNumber(10).pow(currencyDecimals))
                      .toNumber()
                  );

                  return nft ? (
                    <Grid item xs={6} md={4} lg={3} xl={2} key={nft.id}>
                      {selected2 !== "" && selected2 === pk ? (
                        <div
                          style={{
                            position: "relative",
                            zIndex: 2,
                          }}
                        >
                          <ButtonGroup
                            sx={{
                              position: "absolute",
                              top: "10px",
                              right: "10px",
                              background: isDarkTheme
                                ? "#000000e0"
                                : "#ffffffe0",
                              backdropFilter: "blur(200px) brightness(100%)",
                            }}
                          >
                            {viewMode === "grid" ? (
                              <Button
                                onClick={() => {
                                  const nft = listedNfts.find(
                                    (el: any) =>
                                      `${el.listing.mpContractId}-${el.listing.mpListingId}` ===
                                      selected2
                                  );
                                  navigate(
                                    `/collection/${nft.contractId}/token/${nft.tokenId}`
                                  );
                                  window.scrollTo({
                                    top: 0,
                                    behavior: "smooth",
                                  });
                                }}
                              >
                                <VisibilityIcon />
                              </Button>
                            ) : null}
                            <Button
                              onClick={async () => {
                                try {
                                  // get account available balance
                                  const accInfo = await algodClient
                                    .accountInformation(
                                      activeAccount?.address || ""
                                    )
                                    .do();
                                  const availableBalance =
                                    accInfo.amount - accInfo["min-balance"];
                                  // check that available balance is greater than or equal to 0.1235
                                  if (availableBalance < 123500) {
                                    throw new Error(
                                      `Insufficient balance (${
                                        (availableBalance - 123500) / 1e6
                                      } VOI). Please fund your account.`
                                    );
                                  }
                                  const nft = listedNfts.find(
                                    (el: any) =>
                                      `${el.listing.mpContractId}-${el.listing.mpListingId}` ===
                                      selected2
                                  );
                                  const royalties = decodeRoyalties(
                                    nft.metadata.royalties
                                  );
                                  console.log({ ...nft, royalties });
                                  setNft({
                                    ...nft,
                                    royalties,
                                  });
                                  setOpenListSale(true);
                                } catch (e: any) {
                                  console.log(e);
                                  toast.error(e.message);
                                }
                              }}
                            >
                              <EditIcon />
                            </Button>
                            <Button
                              onClick={() => {
                                const nft = listedNfts.find(
                                  (el: any) =>
                                    `${el.listing.mpContractId}-${el.listing.mpListingId}` ===
                                    selected2
                                );
                                handleDeleteListing(nft.listing.mpListingId);
                              }}
                            >
                              <DeleteIcon />
                            </Button>
                          </ButtonGroup>
                        </div>
                      ) : null}
                      <Box
                        style={{
                          width: "100%",
                          cursor: "pointer",
                          borderRadius: "20px",
                        }}
                      >
                        <NFTCard
                          nftName={nft.metadata.name}
                          image={nft.metadata.image}
                          owner={nft.owner}
                          price={price}
                          currency={currencySymbol}
                          onClick={() => {
                            if (idArr.includes(activeAccount?.address || "")) {
                              if (selected2 === pk) {
                                setSelected2("");
                              } else {
                                setSelected2(pk);
                              }
                            } else {
                              navigate(
                                `/collection/${nft.contractId}/token/${nft.tokenId}`
                              );
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                  ) : null;
                })}
              </Grid>
            ) : null}
          </>
        ) : null}
      </Container>
      <TransferModal
        title="Transfer NFT"
        loading={isTransferring}
        open={open}
        handleClose={() => setOpen(false)}
        onSave={handleTransfer}
      />
      {nft ? (
        <ListSaleModal
          title="List NFT for Sale"
          loading={isListing}
          open={openListSale}
          handleClose={() => setOpenListSale(false)}
          onSave={handleListSale}
          nft={nft}
        />
      ) : null}
      {nft ? (
        <ListAuctionModal
          title="List NFT for Auction"
          loading={isListing}
          open={openListAuction}
          handleClose={() => setOpenListAuction(false)}
          onSave={handleListAuction}
          nft={nft}
        />
      ) : null}
    </Layout>
  ) : null;
};
