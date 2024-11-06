import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import VIAIcon from "/src/static/crypto-icons/voi/6779767.svg";
import moment from "moment";
import { useWallet } from "@txnlab/use-wallet-react";
import { toast } from "react-toastify";
import { getAlgorandClients } from "@/wallets";
import { TOKEN_WVOI } from "@/contants/tokens";
import { mp } from "ulujs";

interface BuySaleModalProps {
  open: boolean;
  onClose: () => void;
  item: any; // Replace 'any' with a more specific type if available
}

const BuySaleModal: React.FC<BuySaleModalProps> = ({ open, onClose, item }) => {
  const { activeAccount, signTransactions } = useWallet();

  console.log({ item });

  const handleBuy = async () => {
    if (!activeAccount) {
      toast.info("Please connect wallet!");
      return;
    }
    try {
      const { algodClient, indexerClient } = getAlgorandClients();
      let customR;
      customR = await mp.buy(
        activeAccount.address,
        item,
        {
          contractId: TOKEN_WVOI,
          tokenId: "0",
          symbol: "VOI",
          decimals: 6,
        },
        {
          paymentTokenId: TOKEN_WVOI,
          wrappedNetworkTokenId: TOKEN_WVOI,
          extraTxns: [],
          algodClient,
          indexerClient,
          skipEnsure: false,
        }
      );
      console.log({ customR });
      if (!customR.success) throw new Error("custom failed at end"); // abort
      const stxn = await signTransactions(
        customR.txns.map(
          (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
        )
      );
      await algodClient.sendRawTransaction(stxn as Uint8Array[]).do();
      toast.success("Purchase successful!");
    } catch (e: any) {
      console.log(e);
      toast.error(e.message);
    } finally {
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Purchase</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Are you sure you want to buy this staking position?
        </Typography>
        <Box display="flex" alignItems="center" mt={2}>
          <Typography variant="body1" mr={1}>
            Price:
          </Typography>
          <img
            src={VIAIcon}
            style={{ height: "16px", marginRight: "4px" }}
            alt="VOI Icon"
          />
          <Typography variant="h6">{item.price / 1e6} VOI</Typography>
        </Box>
        <Typography variant="body2" mt={2}>
          Contract ID: {item.token.contractId}
        </Typography>
        <Typography variant="body2">
          Total Staked: {item.totalStaked / 1e6} VOI
        </Typography>
        <Typography variant="body2">
          Unlock Time:{" "}
          {moment.unix(item.unlock).format("MMMM Do YYYY, h:mm:ss a")}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleBuy} color="primary" variant="contained">
          Buy
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BuySaleModal;
