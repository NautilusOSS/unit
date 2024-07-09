import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Button,
  CircularProgress,
  Stack,
  InputLabel,
  Box,
  Grid,
  Typography,
} from "@mui/material";
import { useWallet } from "@txnlab/use-wallet";
import { arc200 } from "ulujs";
import { getAlgorandClients } from "../../../wallets";
import { useDispatch, useSelector } from "react-redux";
import { UnknownAction } from "@reduxjs/toolkit";
import { getSmartTokens } from "../../../store/smartTokenSlice";
import { TokenType } from "../../../types";
import { BigNumber } from "bignumber.js";

interface BuySaleModalProps {
  open: boolean;
  loading: boolean;
  handleClose: () => void;
  onSave: () => Promise<void>;
  title?: string;
  buttonText?: string;
  image: string;
  price: string;
  currency: string;
  priceAU?: string;
  paymentTokenId?: number;
  paymentAltTokenId?: string;
}

const BuySaleModal: React.FC<BuySaleModalProps> = ({
  open,
  loading,
  handleClose,
  onSave,
  image,
  price,
  currency,
  title = "Enter Address",
  buttonText = "Send",
  priceAU = "0",
  paymentTokenId = 0,
  paymentAltTokenId = "0",
}) => {
  console.log({ paymentAltTokenId });
  const dispatch = useDispatch();
  const smartTokens = useSelector((state: any) => state.smartTokens.tokens);
  const smartTokenStatus = useSelector(
    (state: any) => state.smartTokens.status
  );
  useEffect(() => {
    dispatch(getSmartTokens() as unknown as UnknownAction);
  }, [dispatch]);

  const { activeAccount } = useWallet();
  const [netBalance, setNetBalance] = useState("0");
  useEffect(() => {
    if (!activeAccount || paymentAltTokenId !== "0") return;
    const { algodClient } = getAlgorandClients();
    algodClient
      .accountInformation(activeAccount.address)
      .do()
      .then((res: any) => {
        setNetBalance(res.amount.toString());
      });
  }, [activeAccount]);
  console.log({ netBalance });
  const [balance, setBalance] = useState("0");
  useEffect(() => {
    if (!activeAccount) return;
    const { algodClient, indexerClient } = getAlgorandClients();
    new arc200(Number(paymentTokenId), algodClient, indexerClient)
      .arc200_balanceOf(activeAccount.address)
      .then((res: any) => {
        if (res.success) {
          setBalance(res.returnValue.toString());
        }
      });
  }, [activeAccount]);
  const displayBalance = useMemo(() => {
    const smartToken = smartTokens.find(
      (token: TokenType) => `${token.contractId}` === `${paymentTokenId}`
    );
    if (paymentTokenId === 0) {
      return new BigNumber(netBalance).div(new BigNumber(10).pow(6)).toFixed(6);
    } else if (smartToken) {
      const decimals = smartToken.decimals;
      return smartToken?.tokenId === "0"
        ? new BigNumber(balance)
            .plus(new BigNumber(netBalance))
            .div(new BigNumber(10).pow(decimals))
            .toFixed(decimals)
        : new BigNumber(balance)
            .div(new BigNumber(10).pow(decimals))
            .toFixed(decimals);
    }
  }, [balance, netBalance, smartTokens, smartTokenStatus]);

  const canBuy = useMemo(() => {
    return new BigNumber(balance)
      .plus(new BigNumber(netBalance))
      .gte(new BigNumber(priceAU));
  }, [balance, netBalance]);

  const handleSave = async () => {
    await onSave();
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="address-modal-title"
      aria-describedby="address-modal-description"
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "white",
          padding: "40px",
          minHeight: "300px",
          minWidth: "400px",
          width: "50vw",
          borderRadius: "25px",
        }}
      >
        <h2 id="address-modal-title">{title}</h2>
        {!loading ? (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <img
                  src={image}
                  alt="NFT"
                  style={{ width: "100%", borderRadius: "25px" }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 1,
                  }}
                >
                  <InputLabel htmlFor="price">Price</InputLabel>
                  <Typography variant="h5" gutterBottom>
                    {price} {currency}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1,
                  }}
                >
                  <InputLabel htmlFor="balance">{currency} Balance</InputLabel>
                  <Typography variant="h5" gutterBottom>
                    {displayBalance}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Stack sx={{ mt: 3 }} gap={2}>
                  <Button
                    disabled={!canBuy}
                    size="large"
                    fullWidth
                    variant="contained"
                    onClick={handleSave}
                  >
                    {buttonText}
                  </Button>
                  <Button
                    size="large"
                    fullWidth
                    variant="outlined"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              padding: "20px",
            }}
          >
            <CircularProgress size={200} />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BuySaleModal;
