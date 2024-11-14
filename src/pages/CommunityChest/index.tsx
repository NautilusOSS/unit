import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  TextField,
  CircularProgress,
  useTheme,
  Link,
} from "@mui/material";
import styled, { keyframes } from "styled-components";
import { toast } from "react-toastify";
import Layout from "@/layouts/Default";
import BigNumber from "bignumber.js";
import { getAlgorandClients } from "@/wallets";
import algosdk from "algosdk";
import axios from "axios";
import { abi, CONTRACT } from "ulujs";
import { useWallet } from "@txnlab/use-wallet-react";
import party from "party-js";
import DepositModal from "./components/DepositModal";
import WithdrawModal from "./components/WithdrawModal";
import HowItWorksModal from "./components/HowItWorksModal";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

function weightedRandomSelect(data: any) {
  // Step 1: Convert balances to numbers and calculate total weight
  const totalBalance = data.balances.reduce(
    (sum: number, item: any) => sum + Number(item.balance),
    0
  );

  // Step 2: Calculate cumulative weights
  const cumulativeWeights = [];
  let cumulativeSum = 0;
  for (const item of data.balances) {
    cumulativeSum += Number(item.balance) / totalBalance;
    cumulativeWeights.push(cumulativeSum);
  }

  // Step 3: Generate a random number and select based on cumulative weights
  const random = Math.random();
  for (let i = 0; i < cumulativeWeights.length; i++) {
    if (random < cumulativeWeights[i]) {
      return data.balances[i].accountId;
    }
  }
}

const Container = styled(Box)<{ $isDarkTheme: boolean }>`
  padding: 24px;
  max-width: 800px;
  margin: 48px auto 0;
  color: ${(props) => (props.$isDarkTheme ? "#fff" : "#000")};
  background-color: ${(props) =>
    props.$isDarkTheme ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.1)"};

  @media (min-width: 768px) {
    margin-top: 64px;
  }
`;

const StatsCard = styled(Card)<{ $isDarkTheme: boolean }>`
  background-color: ${(props) =>
    props.$isDarkTheme ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.1)"};
  margin-bottom: 24px;
  border-radius: 16px;
  box-shadow: none;
  color: ${(props) => (props.$isDarkTheme ? "#fff" : "#000")};
  margin-top: 48px;
  border: 1px solid
    ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
    margin-top: 64px;
  }
`;

const StatusRow = styled(Box)<{ $isDarkTheme: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  text-align: center;
  flex: 1;
  background-color: ${(props) =>
    props.$isDarkTheme ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.1)"};
  border-radius: 12px;
  margin: 4px;
  border: 1px solid
    ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};

  @media (min-width: 768px) {
    &:last-child {
      border-right: 1px solid
        ${(props) =>
          props.$isDarkTheme
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)"};
    }
  }
`;

const BigNumberDisplay = styled(Typography)<{ $isDarkTheme: boolean }>`
  font-size: 36px;
  font-weight: 600;
  margin: 8px 0;
  font-family: "IBM Plex Mono", monospace;
  color: ${(props) => (props.$isDarkTheme ? "#90caf9" : "#1976d2")};
  text-shadow: ${(props) =>
    props.$isDarkTheme ? "0 0 20px rgba(144, 202, 249, 0.3)" : "none"};
`;

const Label = styled(Typography)<{ $isDarkTheme: boolean }>`
  color: ${(props) =>
    props.$isDarkTheme ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.7)"};
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
`;

const ActionCard = styled(Card)<{ $isDarkTheme: boolean }>`
  background-color: ${(props) =>
    props.$isDarkTheme ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.1)"};
  padding: 24px;
  border-radius: 16px;
  box-shadow: none;
  color: ${(props) => (props.$isDarkTheme ? "#fff" : "#000")};
  border: 1px solid
    ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};

  .MuiInputBase-root {
    color: ${(props) => (props.$isDarkTheme ? "#fff" : "#000")};
    background-color: ${(props) =>
      props.$isDarkTheme ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.8)"};
    border-radius: 8px;
  }

  .MuiOutlinedInput-notchedOutline {
    border-color: ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"};
  }

  .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline {
    border-color: ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"};
  }

  .MuiFormLabel-root {
    color: ${(props) =>
      props.$isDarkTheme
        ? "rgba(255, 255, 255, 0.7)"
        : "rgba(0, 0, 0, 0.6)"} !important;
  }

  h6 {
    color: ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.9)" : "#000"};
    font-weight: 500;
    margin-bottom: 16px;
  }

  .MuiInputLabel-root {
    color: ${(props) =>
      props.$isDarkTheme
        ? "rgba(255, 255, 255, 0.7)"
        : "rgba(0, 0, 0, 0.6)"} !important;
  }

  .MuiInputLabel-root.Mui-focused {
    color: ${(props) =>
      props.$isDarkTheme ? "#90caf9" : "#1976d2"} !important;
  }

  .MuiButton-contained {
    background-color: ${(props) =>
      props.$isDarkTheme ? "#90caf9" : "#1976d2"};
    color: ${(props) => (props.$isDarkTheme ? "#000" : "#fff")};
    font-weight: 500;
    padding: 8px 24px;

    &:hover {
      background-color: ${(props) =>
        props.$isDarkTheme ? "#64b5f6" : "#1565c0"};
    }

    &:disabled {
      background-color: ${(props) =>
        props.$isDarkTheme
          ? "rgba(144, 202, 249, 0.3)"
          : "rgba(25, 118, 210, 0.3)"};
      color: ${(props) =>
        props.$isDarkTheme
          ? "rgba(0, 0, 0, 0.26)"
          : "rgba(255, 255, 255, 0.3)"};
    }
  }
`;

const glowAnimation = keyframes`
  0% {
    filter: drop-shadow(0 0 2px #ffd700);
  }
  50% {
    filter: drop-shadow(0 0 8px #ffd700);
  }
  100% {
    filter: drop-shadow(0 0 2px #ffd700);
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
    gap: 32px;
  }
`;

const ChestIcon = styled.svg<{ $intensity: number }>`
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  animation: ${glowAnimation} 2s ease-in-out infinite;
  filter: drop-shadow(
    0 0 ${(props) => Math.min(props.$intensity * 2, 15)}px #ffd700
  );

  @media (min-width: 768px) {
    width: 96px;
    height: 96px;
    margin-bottom: 0;
  }
`;

const StorySection = styled(Typography)<{ $isDarkTheme: boolean }>`
  text-align: left;
  margin-bottom: 64px;
  font-style: italic;
  color: ${(props) =>
    props.$isDarkTheme ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"};
  width: 100%;
  line-height: 1.6;
  padding: 0 16px;

  @media (min-width: 768px) {
    margin-bottom: 96px;
  }

  .how-it-works-link {
    color: ${(props) => (props.$isDarkTheme ? "#90caf9" : "#1976d2")};
    cursor: pointer;
    text-decoration: none;
    margin-left: 8px;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Disclaimer = styled(Typography)<{ $isDarkTheme: boolean }>`
  text-align: left;
  margin-top: 32px;
  padding: 16px;
  font-size: 12px;
  color: ${(props) =>
    props.$isDarkTheme ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"};
  border-top: 1px solid
    ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
  line-height: 1.6;
`;

// Add keyframes for fade-in animation
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Update the RollDiceSection styled component
const RollDiceSection = styled(Box)<{ $isDarkTheme: boolean }>`
  text-align: center;
  margin-bottom: 32px;
  padding: 16px;
  background-color: ${(props) =>
    props.$isDarkTheme ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.1)"};
  border-radius: 16px;
  border: 1px solid
    ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
  color: ${(props) => (props.$isDarkTheme ? "#fff" : "#000")};

  .selected-account {
    font-size: 24px;
    font-weight: bold;
    color: ${(props) => (props.$isDarkTheme ? "#90caf9" : "#1976d2")};
    margin-top: 16px;
    animation: ${fadeIn} 0.5s ease-in-out; // Apply fade-in animation
  }
`;

interface CommunityChestProps {
  isDarkTheme: boolean;
  connected: boolean;
  address?: string;
}

const CommunityChest: React.FC<CommunityChestProps> = ({
  isDarkTheme,
  connected,
  address,
}) => {
  const { signTransactions } = useWallet();
  const [totalInChest, setTotalInChest] = useState<string>("0");
  const [holders, setHolders] = useState<number>(0);
  const [userBalance, setUserBalance] = useState<string>("0");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [holdersList, setHoldersList] = useState<any[]>([]);

  useEffect(() => {
    if (connected) {
      fetchData();
    }
  }, [connected, address]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { algodClient } = getAlgorandClients();
      // get contract balance
      const ctcInfo = 664258;
      const ctcAddr = algosdk.getApplicationAddress(ctcInfo);
      const accInfo = await algodClient.accountInformation(ctcAddr).do();
      const { amount } = accInfo;
      // get number of holders
      const response = await axios.get(
        `https://mainnet-idx.nautilus.sh/nft-indexer/v1/arc200/balances?contractId=664258`
      );
      const filteredHolders =
        response?.data?.balances?.filter(
          (balance: any) =>
            balance.accountId !== algosdk.getApplicationAddress(664258) &&
            balance.balance !== "0"
        ) || [];
      setHoldersList(filteredHolders);
      const holders = response?.data?.balances?.length || 0;
      // get user balance
      // const userBalance =
      //   response?.data?.balances?.find((b: any) => b.accountId === address)
      //     ?.balance || "0";
      const ci = new CONTRACT(664258, algodClient, null, abi.nt200, {
        addr: address || "",
        sk: Uint8Array.from([]),
      });
      const arc200_balanceOf =
        (await ci.arc200_balanceOf(address))?.returnValue || BigInt(0);
      const userBalance = arc200_balanceOf.toString();

      // Placeholder data
      setTotalInChest(amount);
      setHolders(holders);
      setUserBalance(userBalance);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch community chest data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!connected) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsLoading(true);

      const { algodClient } = getAlgorandClients();
      const ciC = new CONTRACT(664258, algodClient, null, abi.custom, {
        addr: address || "",
        sk: Uint8Array.from([]),
      });
      const ci = new CONTRACT(
        664258,
        algodClient,
        null,
        abi.nt200,
        {
          addr: address || "",
          sk: Uint8Array.from([]),
        },
        true,
        false,
        true
      );
      const amountBI = BigInt(
        new BigNumber(depositAmount).multipliedBy(10 ** 6).toFixed(0)
      );
      let customR;
      for (const p0 of [0, 1]) {
        const buildN = [];
        if (p0 > 0) {
          const txnO = (await ci.createBalanceBox(address)).obj;
          buildN.push({
            ...txnO,
            payment: 28500,
            note: new Uint8Array(Buffer.from("createBalanceBox")),
          });
        }
        {
          const txn0 = (await ci.deposit(amountBI)).obj;
          buildN.push({
            ...txn0,
            payment: amountBI,
            note: new Uint8Array(Buffer.from("Deposit")),
          });
        }
        ciC.setEnableGroupResourceSharing(true);
        ciC.setExtraTxns(buildN);
        customR = await ciC.custom();
        if (customR.success) {
          break;
        }
      }
      if (!customR?.success) {
        toast.error("Failed to deposit");
        return;
      }
      const stxns = await signTransactions(
        customR.txns.map(
          (t: string) => new Uint8Array(Buffer.from(t, "base64"))
        )
      );
      const [stxn] = stxns;
      const dstxn = algosdk.decodeSignedTransaction(stxn as Uint8Array);
      const txId = dstxn.txn.txID();
      await algodClient.sendRawTransaction(stxns as Uint8Array[]).do();
      await algosdk.waitForConfirmation(algodClient, txId, 4);
      party.confetti(document.body, {
        count: party.variation.range(200, 300),
        size: party.variation.range(1, 1.4),
      });
      toast.success("Deposit successful!");
      setDepositModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error depositing:", error);
      toast.error("Failed to deposit");
    } finally {
      setIsLoading(false);
      setDepositAmount("");
    }
  };

  const handleWithdraw = async () => {
    if (!connected) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsLoading(true);
      const { algodClient } = getAlgorandClients();
      const ci = new CONTRACT(664258, algodClient, null, abi.nt200, {
        addr: address || "",
        sk: Uint8Array.from([]),
      });
      const amountBI = BigInt(
        new BigNumber(withdrawAmount).multipliedBy(10 ** 6).toFixed(0)
      );
      ci.setFee(2000);
      const withdrawR = await ci.withdraw(amountBI);
      if (!withdrawR.success) {
        toast.error("Failed to withdraw");
        return;
      }
      const stxns = await signTransactions(
        withdrawR.txns.map(
          (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
        )
      );
      const [stxn] = stxns;
      const dstxn = algosdk.decodeSignedTransaction(stxn as Uint8Array);
      const txId = dstxn.txn.txID();
      await algodClient.sendRawTransaction(stxns as Uint8Array[]).do();
      await algosdk.waitForConfirmation(algodClient, txId, 4);
      party.confetti(document.body, {
        count: party.variation.range(200, 300),
        size: party.variation.range(1, 1.4),
      });
      toast.success("Withdrawal successful!");
      setWithdrawModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error withdrawing:", error);
      toast.error("Failed to withdraw");
    } finally {
      setIsLoading(false);
      setWithdrawAmount("");
    }
  };

  const formatAmount = (amount: string): string => {
    return new BigNumber(amount).dividedBy(1e6).toFormat();
  };

  const calculateGlowIntensity = (amount: string): number => {
    const value = new BigNumber(amount).dividedBy(1e6).toNumber();
    // Adjust these thresholds based on your needs
    if (value < 1000) return 1;
    if (value < 10000) return 3;
    if (value < 100000) return 5;
    return 7;
  };

  const handleRollDice = () => {
    if (!connected) {
      toast.error("Please connect your wallet");
      return;
    }
    setIsRolling(true);
    setSelectedAccount(null);
    setTimeout(() => {
      const selected = weightedRandomSelect({ balances: holdersList });
      party.confetti(document.body, {
        count: party.variation.range(200, 300),
        size: party.variation.range(1, 1.4),
      });
      setIsRolling(false);
      setTimeout(() => {
        setSelectedAccount(selected);
      }, 1000);
    }, 2000); // Simulate a delay for cinematic effect
  };

  // Add a function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Address copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy address");
      });
  };

  return (
    <Layout>
      <Container $isDarkTheme={isDarkTheme}>
        <HeaderContainer>
          <ChestIcon
            viewBox="0 0 24 24"
            $intensity={calculateGlowIntensity(totalInChest)}
          >
            <path
              fill={isDarkTheme ? "#ffd700" : "#ffa000"}
              d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v12h14V6H5zm2 2h10v2H7V8zm0 4h10v2H7v-2z"
            />
          </ChestIcon>
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              color: isDarkTheme ? "#fff" : "#000",
            }}
          >
            Community Chest
          </Typography>
        </HeaderContainer>

        <StorySection $isDarkTheme={isDarkTheme}>
          Welcome to the Community Chest - a collaborative pool where members
          can deposit VOI for a chance to win big! Every deposit increases the
          chest's value, and weekly draws give participants the opportunity to
          win exciting rewards. Your deposit remains fully accessible - you can
          withdraw your entire contribution at any time without restrictions.
          Join us in building this treasure trove of possibilities!
          <Link
            component="span"
            className="how-it-works-link"
            onClick={() => setHowItWorksOpen(true)}
          >
            Learn how it works →
          </Link>
        </StorySection>

        <StatsCard
          style={{
            background: "transparent",
            border: "none",
          }}
          $isDarkTheme={isDarkTheme}
        >
          <StatusRow $isDarkTheme={isDarkTheme}>
            <Label $isDarkTheme={isDarkTheme}>Total in Chest</Label>
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <BigNumberDisplay $isDarkTheme={isDarkTheme}>
                  {formatAmount(totalInChest)}
                </BigNumberDisplay>
                <Typography
                  variant="subtitle2"
                  sx={{ color: isDarkTheme ? "#90caf9" : "#1976d2" }}
                >
                  VOI
                </Typography>
              </>
            )}
          </StatusRow>

          <StatusRow $isDarkTheme={isDarkTheme}>
            <Label $isDarkTheme={isDarkTheme}>Number of Holders</Label>
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <BigNumberDisplay $isDarkTheme={isDarkTheme}>
                  {holders.toLocaleString()}
                </BigNumberDisplay>
                <Typography
                  variant="subtitle2"
                  sx={{ color: isDarkTheme ? "#90caf9" : "#1976d2" }}
                >
                  PARTICIPANTS
                </Typography>
              </>
            )}
          </StatusRow>

          <StatusRow $isDarkTheme={isDarkTheme}>
            <Label $isDarkTheme={isDarkTheme}>Your Balance</Label>
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <BigNumberDisplay $isDarkTheme={isDarkTheme}>
                  {formatAmount(userBalance)}
                </BigNumberDisplay>
                <Typography
                  variant="subtitle2"
                  sx={{ color: isDarkTheme ? "#90caf9" : "#1976d2" }}
                >
                  VOI
                </Typography>
              </>
            )}
          </StatusRow>
        </StatsCard>

        <RollDiceSection $isDarkTheme={isDarkTheme}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Roll Them Dice
          </Typography>
          <Button
            variant="contained"
            onClick={handleRollDice}
            disabled={isRolling || !connected}
            sx={{
              bgcolor: isDarkTheme ? "#90caf9" : "#1976d2",
              color: isDarkTheme ? "#000" : "#fff",
              "&:hover": {
                bgcolor: isDarkTheme ? "#64b5f6" : "#1565c0",
              },
            }}
          >
            {isRolling ? <CircularProgress size={24} /> : "Roll the Dice"}
          </Button>
          {selectedAccount && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 2,
              }}
            >
              <Typography className="selected-account">
                🎉 Winner:{" "}
                {`${selectedAccount.slice(0, 6)}...${selectedAccount.slice(
                  -6
                )}`}{" "}
                🎉
              </Typography>
              <ContentCopyIcon
                sx={{
                  cursor: "pointer",
                  fontSize: "20px",
                  ml: 1,
                  color: isDarkTheme ? "#90caf9" : "#1976d2",
                  "&:hover": { opacity: 0.8 },
                }}
                onClick={() => copyToClipboard(selectedAccount)}
              />
            </Box>
          )}
        </RollDiceSection>

        <ActionCard
          style={{
            background: "transparent",
            border: "none",
          }}
          $isDarkTheme={isDarkTheme}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Deposit
            </Typography>
            <Button
              variant="contained"
              onClick={() => setDepositModalOpen(true)}
              disabled={!connected}
              fullWidth
            >
              Deposit VOI
            </Button>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Withdraw
            </Typography>
            <Button
              variant="contained"
              onClick={() => setWithdrawModalOpen(true)}
              disabled={!connected}
              fullWidth
            >
              Withdraw VOI
            </Button>
          </Box>
        </ActionCard>

        <Disclaimer $isDarkTheme={isDarkTheme}>
          DISCLAIMER: The Community Chest is an experimental feature.
          Participants acknowledge and accept all risks associated with using
          this service. While deposits can be withdrawn at any time without
          restrictions, smart contract interactions may take a few seconds to
          process. Past performance does not guarantee future results. Always
          invest responsibly and never commit more than you can afford to lose.
        </Disclaimer>

        <DepositModal
          open={depositModalOpen}
          onClose={() => {
            setDepositModalOpen(false);
            setDepositAmount("");
          }}
          onDeposit={handleDeposit}
          amount={depositAmount}
          setAmount={setDepositAmount}
          isLoading={isLoading}
          isDarkTheme={isDarkTheme}
        />

        <WithdrawModal
          open={withdrawModalOpen}
          onClose={() => {
            setWithdrawModalOpen(false);
            setWithdrawAmount("");
          }}
          onWithdraw={handleWithdraw}
          amount={withdrawAmount}
          setAmount={setWithdrawAmount}
          isLoading={isLoading}
          isDarkTheme={isDarkTheme}
        />

        <HowItWorksModal
          open={howItWorksOpen}
          onClose={() => setHowItWorksOpen(false)}
          isDarkTheme={isDarkTheme}
        />
      </Container>
    </Layout>
  );
};

export default CommunityChest;
