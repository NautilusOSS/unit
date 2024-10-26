import React from "react";
import {
  Button,
  TableCell,
  TableRow,
  useTheme,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Skeleton from "@mui/material/Skeleton";
import { useStakingContract } from "@/hooks/staking";
import { getStakingTotalTokens, getStakingUnlockTime } from "@/utils/staking";
import moment from "moment";
import { useWallet } from "@txnlab/use-wallet-react";
import { getAlgorandClients } from "@/wallets";
import { CONTRACT } from "ulujs";
import { toast } from "react-toastify";
import VIAIcon from "/src/static/crypto-icons/voi/6779767.svg";
import { waitForConfirmation } from "algosdk";
import party from "party-js";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const { algodClient } = getAlgorandClients();

interface PositionTokenRowProps {
  nft: {
    contractId: string;
    tokenId: string;
  };
  index: number;
  arc72TokensLength: number;
  lastRowStyle: React.CSSProperties;
  cellStyle: React.CSSProperties;
}

const PositionTokenRow: React.FC<PositionTokenRowProps> = ({
  nft,
  index,
  arc72TokensLength,
  lastRowStyle,
  cellStyle,
}) => {
  const { isDarkTheme } = useSelector((state: RootState) => state.theme);
  const { activeAccount, signTransactions } = useWallet();
  const { data, isLoading, refetch } = useStakingContract(Number(nft.tokenId), {
    includeRewards: true,
    includeWithdrawable: true,
  });

  const handleClaim = async () => {
    if (!activeAccount) return;
    const apid = Number(nft.contractId);
    const ci = new CONTRACT(
      apid,
      algodClient,
      undefined,
      {
        name: "NautilusVoiStaking",
        methods: [
          {
            name: "withdraw",
            args: [
              {
                type: "uint64",
                name: "tokenId",
              },
              {
                type: "uint64",
                name: "amount",
              },
            ],
            readonly: false,
            returns: {
              type: "void",
            },
            desc: "Withdraw funds from contract.",
          },
        ],
        events: [],
      },
      {
        addr: activeAccount.address,
        sk: new Uint8Array(0),
      }
    );
    ci.setFee(5000);
    const withdrawR2 = await ci.withdraw(
      nft.tokenId,
      BigInt(data.withdrawable)
    );
    if (!withdrawR2.success) {
      console.error({ withdrawR2 });
      throw new Error("withdraw failed in simulate");
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
    toast.success("Claimed");
    party.confetti(document.body, {
      count: party.variation.range(200, 300),
      size: party.variation.range(1, 1.4),
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(`${label} copied to clipboard`);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy to clipboard");
      });
  };

  const cellStyleWithColor = {
    ...cellStyle,
  };

  return (
    <TableRow
      key={`${nft.contractId}-${nft.tokenId}`}
      style={index === arc72TokensLength - 1 ? lastRowStyle : undefined}
    >
      {isLoading ? (
        <TableCell style={cellStyleWithColor} colSpan={5} align="right">
          <Skeleton variant="text" />
        </TableCell>
      ) : (
        <>
          <TableCell style={cellStyleWithColor} align="right">
            <a
              href={`https://block.voi.network/explorer/application/${data.contractId}/global-state`}
              target="_blank"
              style={{
                color: isDarkTheme ? "white" : "inherit",
                fontWeight: 100,
              }}
              rel="noopener noreferrer"
            >
              {data.contractId}
            </a>
            <ContentCopyIcon
              style={{
                color: isDarkTheme ? "white" : "inherit",
                cursor: "pointer",
                marginLeft: "5px",
                fontSize: "16px",
              }}
              onClick={() => copyToClipboard(data.contractId, "Account ID")}
            />
          </TableCell>
          <TableCell style={cellStyleWithColor} align="center">
            <a
              href={`https://block.voi.network/explorer/account/${data.contractAddress}/transactions`}
              target="_blank"
              style={{
                color: isDarkTheme ? "white" : "inherit",
                fontWeight: 100,
              }}
              rel="noopener noreferrer"
            >
              {data.contractAddress.slice(0, 10)}...
              {data.contractAddress.slice(-10)}
            </a>
            <ContentCopyIcon
              style={{
                color: isDarkTheme ? "white" : "inherit",
                cursor: "pointer",
                marginLeft: "5px",
                fontSize: "16px",
              }}
              onClick={() =>
                copyToClipboard(data.contractAddress, "Account Address")
              }
            />
          </TableCell>
          <TableCell
            style={{
              ...cellStyleWithColor,
              color: isDarkTheme ? "white" : "inherit",
              fontWeight: 100,
            }}
            align="right"
          >
            {getStakingTotalTokens(data)} VOI
          </TableCell>
          <TableCell
            style={{
              ...cellStyleWithColor,
              color: isDarkTheme ? "white" : "inherit",
              fontWeight: 100,
            }}
            align="right"
          >
            {moment.unix(getStakingUnlockTime(data)).fromNow(true)}
          </TableCell>
          <TableCell style={cellStyleWithColor} align="right">
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
                {Number(data.withdrawable) / 1e6} VOI
              </Typography>
            </Button>
          </TableCell>
        </>
      )}
    </TableRow>
  );
};

export default PositionTokenRow;
