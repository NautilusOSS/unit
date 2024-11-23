import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  SelectChangeEvent,
  Paper,
  IconButton,
  Alert,
} from "@mui/material";
import { useTheme } from "../../contexts/ThemeContext";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { TOKENS, TokenConfig } from "../../config/tokens";
import { useTokenBalances } from "../../hooks/useTokenBalances";
import { useWallet } from "@txnlab/use-wallet-react";
import { abi, CONTRACT } from "ulujs";
import { getAlgorandClients } from "@/wallets";
import algosdk from "algosdk";
import BigNumber from "bignumber.js";
import TransactionPendingModal from "../../components/TransactionPendingModal";
import party from "party-js";

type Direction = "ARC200_TO_ASA" | "ASA_TO_ARC200";

const formatDisplayBalance = (balance: string): string => {
  // Remove trailing zeros after decimal point
  const [whole, decimal] = balance.split(".");
  if (!decimal) return whole;
  const trimmedDecimal = decimal.replace(/0+$/, "");
  return trimmedDecimal ? `${whole}.${trimmedDecimal}` : whole;
};

const UnitConverter: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { activeAccount, signTransactions } = useWallet();
  const [selectedToken, setSelectedToken] = useState("");
  const [direction, setDirection] = useState<Direction>("ARC200_TO_ASA");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const selectedTokenConfig = selectedToken ? TOKENS[selectedToken] : null;
  const {
    arc200Balance,
    asaBalance,
    loading,
    error: balanceError,
    refetch: refetchBalances,
  } = useTokenBalances(selectedTokenConfig);

  const handleTokenChange = (event: SelectChangeEvent) => {
    setSelectedToken(event.target.value);
    setAmount("");
    setError(null);
  };

  const toggleDirection = () => {
    setDirection((prev) =>
      prev === "ARC200_TO_ASA" ? "ASA_TO_ARC200" : "ARC200_TO_ASA"
    );
    setAmount("");
    setError(null);
  };

  const validateAmount = (value: string, maxBalance: string): boolean => {
    if (!value || !maxBalance) return false;

    try {
      const inputAmount = parseFloat(value);
      const maxAmount = parseFloat(maxBalance);
      return inputAmount > 0 && inputAmount <= maxAmount;
    } catch {
      return false;
    }
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const sourceBalance =
        direction === "ARC200_TO_ASA" ? arc200Balance : asaBalance;

      if (value && !validateAmount(value, sourceBalance)) {
        setError(
          `Amount must be between 0 and ${formatDisplayBalance(sourceBalance)}`
        );
      } else {
        setError(null);
      }

      setAmount(value);
    }
  };

  const handleMaxClick = () => {
    const maxBalance =
      direction === "ARC200_TO_ASA" ? arc200Balance : asaBalance;
    setAmount(formatDisplayBalance(maxBalance));
    setError(null);
  };

  const handleConvert = async () => {
    const token = TOKENS[selectedToken];
    setIsPending(true);
    setError(null);

    try {
      const { algodClient, indexerClient } = getAlgorandClients();

      if (direction === "ARC200_TO_ASA") {
        // Existing ARC200 to ASA conversion logic
        const ci = new CONTRACT(
          token.unitAppId,
          algodClient,
          indexerClient,
          abi.custom,
          {
            addr: activeAccount?.address || "",
            sk: new Uint8Array(),
          }
        );
        const builder = {
          arc200: new CONTRACT(
            token.arc200AppId,
            algodClient,
            indexerClient,
            abi.arc200,
            {
              addr: activeAccount?.address || "",
              sk: new Uint8Array(),
            },
            true,
            false,
            true
          ),
          saw200: new CONTRACT(
            token.unitAppId,
            algodClient,
            indexerClient,
            {
              name: "saw200",
              desc: "saw200",
              methods: [
                {
                  name: "deposit",
                  args: [
                    {
                      type: "uint64",
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
              sk: new Uint8Array(),
            },
            true,
            false,
            true
          ),
        };
        const buildN = [];
        {
          const txnO = (
            await builder.arc200.arc200_approve(
              algosdk.getApplicationAddress(token.unitAppId),
              BigInt(
                new BigNumber(amount).times(10 ** token.decimals).toFixed(0)
              )
            )
          )?.obj;
          const msg = `Approving ARC200 to ASA conversion for ${amount} ${token.name}`;
          buildN.push({
            ...txnO,
            note: new TextEncoder().encode(msg),
          });
        }
        {
          const txnO = (
            await builder.saw200.deposit(
              BigInt(
                new BigNumber(amount).times(10 ** token.decimals).toFixed(0)
              )
            )
          )?.obj;
          const msg = `Depositing ${amount} ${token.name} for ARC200 to ASA conversion`;
          const assetOptin = {
            xaid: token.asaAssetId,
            snd: activeAccount?.address || "",
            arcv: activeAccount?.address || "",
            xamt: 0,
          };
          buildN.push({
            ...txnO,
            ...assetOptin,
            note: new TextEncoder().encode(msg),
          });
        }
        ci.setFee(2000);
        ci.setEnableGroupResourceSharing(true);
        ci.setExtraTxns(buildN);
        const customR = await ci.custom();
        if (!customR.success) {
          throw new Error(customR.error);
        }
        const stxns = await signTransactions(
          customR.txns.map(
            (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
          )
        );
        const res = await algodClient
          .sendRawTransaction(stxns as Uint8Array[])
          .do();

        // Wait for transaction confirmation
        await algodClient.status().do();
        await algodClient.pendingTransactionInformation(res.txId).do();

        // Add delay before refetching
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Refetch balances after delay
        await refetchBalances();

        // Clear amount after successful conversion
        setAmount("");

        // Add confetti celebration
        party.confetti(document.body, {
          count: party.variation.range(50, 80),
          size: party.variation.range(1, 1.5),
          spread: party.variation.range(35, 45),
          speed: party.variation.range(300, 400),
        });
      } else {
        // ASA to ARC200 conversion logic
        const ci = new CONTRACT(
          token.unitAppId,
          algodClient,
          indexerClient,
          abi.custom,
          {
            addr: activeAccount?.address || "",
            sk: new Uint8Array(),
          }
        );
        const builder = {
          saw200: new CONTRACT(
            token.unitAppId,
            algodClient,
            indexerClient,
            {
              name: "saw200",
              desc: "saw200",
              methods: [
                {
                  name: "withdraw",
                  args: [
                    {
                      type: "uint64",
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
              sk: new Uint8Array(),
            },
            true,
            false,
            true
          ),
        };
        const buildN = [];
        {
          const txnO = (
            await builder.saw200.withdraw(
              BigInt(
                new BigNumber(amount).times(10 ** token.decimals).toFixed(0)
              )
            )
          )?.obj;
          const msg = `Withdrawing ${amount} ${token.name} for ASA to ARC200 conversion`;
          const assetTransfer = {
            type: "axfer",
            xaid: token.asaAssetId,
            aamt: BigInt(
              new BigNumber(amount).times(10 ** token.decimals).toFixed(0)
            ),
            arcv: algosdk.getApplicationAddress(token.unitAppId),
          };
          buildN.push({
            ...txnO,
            ...assetTransfer,
            note: new TextEncoder().encode(msg),
          });
        }
        ci.setFee(2000);
        ci.setEnableGroupResourceSharing(true);
        ci.setExtraTxns(buildN);
        const customR = await ci.custom();
        if (!customR.success) {
          throw new Error(customR.error);
        }
        const stxns = await signTransactions(
          customR.txns.map(
            (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
          )
        );
        const res = await algodClient
          .sendRawTransaction(stxns as Uint8Array[])
          .do();

        // Wait for transaction confirmation
        await algodClient.status().do();
        await algodClient.pendingTransactionInformation(res.txId).do();

        // Add delay before refetching
        await new Promise((resolve) => setTimeout(resolve, 15_000));
        // Refetch balances after delay
        await refetchBalances();

        // Clear amount after successful conversion
        setAmount("");

        // Add confetti celebration
        party.confetti(document.body, {
          count: party.variation.range(50, 80),
          size: party.variation.range(1, 1.5),
          spread: party.variation.range(35, 45),
          speed: party.variation.range(300, 400),
        });
      }
    } catch (error) {
      console.error(error);
      setError("Failed to convert");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h2" component="h1" align="center" gutterBottom>
          Unit Converter
        </Typography>
        <Typography
          variant="h5"
          align="center"
          sx={{
            color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
            mb: 4,
          }}
          paragraph
        >
          Convert between ARC200 and ASA
        </Typography>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            backgroundColor: isDarkMode ? "rgb(28, 28, 28)" : "white",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {!activeAccount && (
              <Alert severity="info">
                Connect your wallet to view balances and perform conversions
              </Alert>
            )}

            <FormControl fullWidth>
              <InputLabel
                id="token-select-label"
                sx={{
                  color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : undefined,
                }}
              >
                Select Token
              </InputLabel>
              <Select
                labelId="token-select-label"
                value={selectedToken}
                label="Select Token"
                onChange={handleTokenChange}
                sx={{
                  color: isDarkMode ? "white" : undefined,
                  ".MuiOutlinedInput-notchedOutline": {
                    borderColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.23)"
                      : undefined,
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.4)"
                      : undefined,
                  },
                }}
              >
                {Object.entries(TOKENS).map(([id, token]) => (
                  <MenuItem key={id} value={id}>
                    {token.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedToken && activeAccount && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: isDarkMode
                    ? "rgb(38, 38, 38)"
                    : "rgb(245, 245, 245)",
                }}
              >
                <Typography
                  sx={{ color: isDarkMode ? "white" : "text.primary" }}
                >
                  ARC200 Balance:{" "}
                  {loading ? "Loading..." : formatDisplayBalance(arc200Balance)}
                </Typography>
                <Typography
                  sx={{ color: isDarkMode ? "white" : "text.primary" }}
                >
                  ASA Balance:{" "}
                  {loading ? "Loading..." : formatDisplayBalance(asaBalance)}
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                px: 2,
                py: 1,
                borderRadius: 1,
                backgroundColor: isDarkMode
                  ? "rgb(38, 38, 38)"
                  : "rgb(245, 245, 245)",
              }}
            >
              <Typography sx={{ color: isDarkMode ? "white" : "text.primary" }}>
                {direction === "ARC200_TO_ASA" ? "ARC200" : "ASA"}
              </Typography>
              <IconButton
                onClick={toggleDirection}
                sx={{
                  color: isDarkMode ? "white" : "primary.main",
                  "&:hover": {
                    backgroundColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.1)"
                      : undefined,
                  },
                }}
              >
                <SwapHorizIcon />
              </IconButton>
              <Typography sx={{ color: isDarkMode ? "white" : "text.primary" }}>
                {direction === "ARC200_TO_ASA" ? "ASA" : "ARC200"}
              </Typography>
            </Box>

            <Box sx={{ position: "relative" }}>
              <TextField
                fullWidth
                label="Amount"
                value={amount}
                onChange={handleAmountChange}
                error={!!error}
                helperText={
                  error ||
                  `Available: ${formatDisplayBalance(
                    direction === "ARC200_TO_ASA" ? arc200Balance : asaBalance
                  )}`
                }
                type="text"
                placeholder="Enter amount"
                sx={{
                  "& label": {
                    color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : undefined,
                  },
                  "& label.Mui-focused": {
                    color: isDarkMode ? "white" : undefined,
                  },
                  "& .MuiOutlinedInput-root": {
                    color: isDarkMode ? "white" : undefined,
                    "& fieldset": {
                      borderColor: isDarkMode
                        ? "rgba(255, 255, 255, 0.23)"
                        : undefined,
                    },
                    "&:hover fieldset": {
                      borderColor: isDarkMode
                        ? "rgba(255, 255, 255, 0.4)"
                        : undefined,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: isDarkMode ? "white" : undefined,
                    },
                  },
                  "& .MuiFormHelperText-root": {
                    color: error
                      ? "error.main"
                      : isDarkMode
                      ? "rgba(255, 255, 255, 0.7)"
                      : undefined,
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={handleMaxClick}
                      sx={{
                        minWidth: "auto",
                        px: 1,
                        color: isDarkMode
                          ? "rgba(255, 255, 255, 0.7)"
                          : "primary.main",
                        "&:hover": {
                          backgroundColor: isDarkMode
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.04)",
                        },
                      }}
                    >
                      MAX
                    </Button>
                  ),
                }}
              />
            </Box>

            {selectedToken && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: isDarkMode
                    ? "rgb(38, 38, 38)"
                    : "rgb(245, 245, 245)",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: isDarkMode
                      ? "rgba(255, 255, 255, 0.7)"
                      : "text.secondary",
                  }}
                >
                  Selected Token Details:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: isDarkMode ? "white" : "text.primary" }}
                >
                  ARC200 App ID: {TOKENS[selectedToken].arc200AppId}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: isDarkMode ? "white" : "text.primary" }}
                >
                  Unit App ID: {TOKENS[selectedToken].unitAppId}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: isDarkMode ? "white" : "text.primary" }}
                >
                  ASA Asset ID: {TOKENS[selectedToken].asaAssetId}
                </Typography>
              </Box>
            )}

            {balanceError && <Alert severity="error">{balanceError}</Alert>}

            <Button
              className="convert-button"
              variant="contained"
              size="large"
              onClick={handleConvert}
              disabled={
                !selectedToken || 
                !amount || 
                !activeAccount || 
                !!error || 
                parseFloat(amount) === 0
              }
              sx={{ mt: 2 }}
            >
              Convert
            </Button>
          </Box>
        </Paper>
      </Box>
      <TransactionPendingModal
        open={isPending}
        message={`Converting ${amount} ${
          selectedToken ? TOKENS[selectedToken].name : ""
        }`}
      />
    </Container>
  );
};

export default UnitConverter;
