import React from "react";
import {
  TableRow,
  TableCell,
  Button,
  Skeleton,
  Typography,
  useTheme,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import moment from "moment";
import { useWallet } from "@txnlab/use-wallet-react";
import { getAlgorandClients } from "@/wallets";
import { CONTRACT } from "ulujs";
import { toast } from "react-toastify";
import VIAIcon from "/src/static/crypto-icons/voi/6779767.svg";
import { getStakingTotalTokens, getStakingUnlockTime } from "@/utils/staking";
import { useStakingContract } from "@/hooks/staking";
import { waitForConfirmation } from "algosdk";
import party from "party-js";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const { algodClient } = getAlgorandClients();

interface PositionRowProps {
  position: {
    contractId: string;
    tokenId: string;
    contractAddress: string;
    withdrawable: string;
  };
  cellStyle: React.CSSProperties;
}

const PositionRow: React.FC<PositionRowProps> = ({ position, cellStyle }) => {
  const { isDarkTheme } = useSelector((state: RootState) => state.theme);
  const { activeAccount, signTransactions } = useWallet();
  const { data, isLoading, refetch } = useStakingContract(
    Number(position.contractId),
    {
      includeRewards: true,
      includeWithdrawable: true,
    }
  );
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`${label} copied to clipboard`))
      .catch(() => toast.error("Failed to copy to clipboard"));
  };
  const handleClaim = async () => {
    if (!activeAccount) return;
    const apid = Number(position.contractId);
    const ci = new CONTRACT(
      apid,
      algodClient,
      undefined,
      {
        name: "NautilusVoiStaking",
        methods: [
          {
            name: "withdraw",
            args: [{ type: "uint64", name: "amount" }],
            readonly: false,
            returns: { type: "uint64" },
            desc: "Withdraw funds from contract.",
          },
        ],
        events: [],
      },
      { addr: activeAccount.address, sk: new Uint8Array(0) }
    );
    ci.setFee(5000);
    try {
      const withdrawR2 = await ci.withdraw(BigInt(data?.withdrawable || 0));
      if (!withdrawR2.success) {
        console.log({ withdrawR2 });
        throw new Error("Withdraw failed in simulate");
      }
      const stxns = await signTransactions(
        withdrawR2.txns.map(
          (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
        )
      );
      const { txId } = await algodClient
        .sendRawTransaction(stxns as Uint8Array[])
        .do();
      await waitForConfirmation(algodClient, txId, 4);
      await refetch();
      party.confetti(document.body, {
        count: party.variation.range(200, 300),
        size: party.variation.range(1, 1.4),
      });
      toast.success("Claimed");
    } catch (error) {
      console.error("Error claiming rewards:", error);
      toast.error("Failed to claim rewards");
    }
  };

  const cellStyleWithColor = {
    ...cellStyle,
  };

  if (isLoading) {
    return (
      <TableRow>
        <TableCell style={cellStyleWithColor} colSpan={5} align="right">
          <Skeleton variant="text" />
        </TableCell>
      </TableRow>
    );
  }
  return (
    <TableRow>
      <TableCell
        style={{
          ...cellStyleWithColor,
          color: isDarkTheme ? "white" : "black",
          fontWeight: 100,
        }}
        align="right"
      >
        <a
          href={`https://block.voi.network/explorer/application/${position.contractId}/global-state`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit" }}
        >
          {position.contractId}
        </a>
        <ContentCopyIcon
          style={{
            cursor: "pointer",
            marginLeft: "5px",
            fontSize: "16px",
            color: "inherit",
          }}
          onClick={() => copyToClipboard(position.contractId, "Account ID")}
        />
      </TableCell>
      <TableCell
        style={{
          ...cellStyleWithColor,
          color: isDarkTheme ? "white" : "black",
          fontWeight: 100,
        }}
        align="center"
      >
        <a
          href={`https://block.voi.network/explorer/account/${position.contractAddress}/transactions`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit" }}
        >
          {position.contractAddress.slice(0, 10)}...
          {position.contractAddress.slice(-10)}
        </a>
        <ContentCopyIcon
          style={{
            cursor: "pointer",
            marginLeft: "5px",
            fontSize: "16px",
            color: "inherit",
          }}
          onClick={() =>
            copyToClipboard(position.contractAddress, "Account Address")
          }
        />
      </TableCell>
      <TableCell
        style={{
          ...cellStyleWithColor,
          color: isDarkTheme ? "white" : "black",
          fontWeight: 100,
        }}
        align="right"
      >
        {getStakingTotalTokens(position)} VOI
      </TableCell>
      <TableCell
        style={{
          ...cellStyleWithColor,
          color: isDarkTheme ? "white" : "black",
          fontWeight: 100,
        }}
        align="right"
      >
        {moment.unix(getStakingUnlockTime(position)).fromNow(true)}
      </TableCell>
      <TableCell
        style={{
          ...cellStyleWithColor,
          color: isDarkTheme ? "white" : "black",
          fontWeight: 100,
        }}
        align="right"
      >
        <Button
          sx={{
            borderRadius: "20px",
            color: "inherit",
          }}
          onClick={handleClaim}
          disabled={data?.withdrawable === "0"}
          variant={isDarkTheme ? "outlined" : "contained"}
          size="small"
        >
          <img src={VIAIcon} style={{ height: "12px" }} alt="VOI Icon" />
          <Typography
            variant="body2"
            sx={{
              ml: 1,
              color: "white",
              fontWeight: 500,
            }}
          >
            {Number(data?.withdrawable || 0) / 1e6} VOI
          </Typography>
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default PositionRow;
