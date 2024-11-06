import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Container,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useWallet } from "@txnlab/use-wallet-react";
import { abi, CONTRACT } from "ulujs";
import { getAlgorandClients } from "@/wallets";
import { waitForConfirmation } from "algosdk";
import { toast } from "react-toastify";
import { ShadedInput } from "@/components/ShadedInput";
import TransactionDetails from "@/components/TransactionDetails";
import Layout from "@/layouts/Default";
import styled from "styled-components";
import axios from "axios";
import algosdk from "algosdk";
import BigNumber from "bignumber.js";
import { Link } from "react-router-dom";
import TokenList from "./components/TokenList";

const { algodClient } = getAlgorandClients();

const FormContainer = styled(Box)<{ $isDarkTheme: boolean }>`
  background: ${(props) =>
    props.$isDarkTheme ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)"};
  border-radius: 24px;
  padding: 32px;
  border: 1px solid
    ${(props) => (props.$isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "#D8D8E1")};
`;

const StyledFormLabel = styled(FormLabel)<{ $isDarkTheme: boolean }>`
  color: ${(props) => (props.$isDarkTheme ? "#fff" : "#0C0C10")};
  margin-bottom: 8px;
  font-family: "Plus Jakarta Sans";
  font-size: 14px;
  font-weight: 600;
`;

const PageTitle = styled(Typography)<{ $isDarkTheme: boolean }>`
  color: ${(props) => (props.$isDarkTheme ? "#fff" : "#0C0C10")};
  font-family: "Plus Jakarta Sans";
  font-weight: 700;
`;

const HelperText = styled(Typography)<{ $isDarkTheme: boolean }>`
  color: ${(props) =>
    props.$isDarkTheme ? "rgba(255, 255, 255, 0.7)" : "rgba(12, 12, 16, 0.6)"};
  font-size: 12px;
  margin-top: 4px;
`;

const LengthIndicator = styled.span<{ $isDarkTheme: boolean }>`
  color: ${(props) =>
    props.$isDarkTheme ? "rgba(255, 255, 255, 0.5)" : "rgba(12, 12, 16, 0.5)"};
  font-size: 12px;
  margin-left: 8px;
  font-family: "IBM Plex Sans Condensed";
`;

const InputHeader = styled.div<{ $isDarkTheme: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  color: ${(props) => (props.$isDarkTheme ? "#fff" : "#0C0C10")};
`;

const CharacterCount = styled.div<{
  $isDarkTheme: boolean;
  $isAtLimit: boolean;
}>`
  color: ${(props) =>
    props.$isAtLimit
      ? "#ff6b00"
      : props.$isDarkTheme
      ? "rgba(255, 255, 255, 0.5)"
      : "rgba(12, 12, 16, 0.5)"};
  font-size: 12px;
  font-family: "IBM Plex Sans Condensed";
  margin-top: 4px;
  text-align: right;
`;

interface ContractStub {
  contractId: number;
  hash: string;
  creator: string;
  active: number;
}

interface ContractOption {
  contractId: number;
  address: string;
  hash: string;
  creator: string;
}

const ContractIdDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ContractId = styled.div`
  font-family: "IBM Plex Sans Condensed";
  font-size: 14px;
  font-weight: 500;
`;

const ContractAddress = styled.div`
  font-family: "IBM Plex Sans Condensed";
  font-size: 12px;
  color: ${(props) =>
    props.theme.isDarkTheme
      ? "rgba(255, 255, 255, 0.7)"
      : "rgba(12, 12, 16, 0.6)"};
`;

const CostBreakdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

const CostItem = styled.div<{ $isDarkTheme: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid
    ${(props) =>
      props.$isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};

  &:last-child {
    border-bottom: none;
    font-weight: 600;
  }
`;

const CostLabel = styled.span<{ $isDarkTheme: boolean }>`
  color: ${(props) =>
    props.$isDarkTheme ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.7)"};
`;

const CostValue = styled.span<{ $isDarkTheme: boolean }>`
  color: ${(props) => (props.$isDarkTheme ? "#fff" : "#000")};
  font-family: "IBM Plex Sans Condensed";
`;

const CostTitle = styled(Typography)<{ $isDarkTheme: boolean }>`
  color: ${(props) => (props.$isDarkTheme ? "#fff" : "#000")};
  font-weight: 600;
`;

const StyledLink = styled(Link)`
  color: #2958ff;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const StyledDialog = styled(Dialog)<{ $isDarkTheme: boolean }>`
  .MuiDialog-paper {
    background-color: ${(props) => (props.$isDarkTheme ? "#1a1a1a" : "#fff")};
    color: ${(props) => (props.$isDarkTheme ? "#fff" : "inherit")};
  }
`;

const StyledDialogTitle = styled(DialogTitle)<{ $isDarkTheme: boolean }>`
  color: ${(props) => (props.$isDarkTheme ? "#fff" : "inherit")};
  font-family: "Plus Jakarta Sans";
  font-weight: 600;
`;

export const CreateARC200: React.FC = () => {
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );
  const { activeAccount, signTransactions } = useWallet();
  const [name, setName] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");
  const [totalSupply, setTotalSupply] = useState<string>("1000000");
  const [decimals, setDecimals] = useState<string>("6");
  const [txnId, setTxnId] = useState<string>("");
  const [txnMsg, setTxnMsg] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contracts, setContracts] = useState<ContractOption[]>([]);
  const [selectedContract, setSelectedContract] =
    useState<ContractOption | null>(null);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [tokens, setTokens] = useState<any[]>([]);

  const MAX_NAME_LENGTH = 32;
  const MAX_SYMBOL_LENGTH = 8;

  useEffect(() => {
    const fetchContracts = async () => {
      setIsLoadingContracts(true);
      try {
        const response = await axios.get(
          "https://mainnet-idx.nautilus.sh/nft-indexer/v1/arc200/stubs/token?active=0"
        );
        const contractOptions: ContractOption[] = response.data.stubs.map(
          (stub: ContractStub) => ({
            contractId: stub.contractId,
            address: algosdk.getApplicationAddress(stub.contractId),
            hash: stub.hash,
            creator: stub.creator,
          })
        );
        setContracts(contractOptions);
      } catch (error) {
        console.error("Error fetching contracts:", error);
        toast.error("Failed to load contracts");
      } finally {
        setIsLoadingContracts(false);
      }
    };

    fetchContracts();
  }, []);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await axios.get(
          "https://mainnet-idx.nautilus.sh/nft-indexer/v1/arc200/tokens?includes=all"
        );
        setTokens(response.data.tokens || []);
      } catch (error) {
        console.error("Error fetching tokens:", error);
        toast.error("Failed to load tokens");
      }
    };

    fetchTokens();
  }, []);

  const handleCreateToken = async () => {
    if (!activeAccount) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!name || !symbol || !totalSupply || !decimals || !selectedContract) {
      toast.error("Please fill in all fields");
      return;
    }

    console.log({ name, symbol, totalSupply, decimals, selectedContract });

    setIsSubmitting(true);

    try {
      const ci = new CONTRACT(
        selectedContract.contractId,
        algodClient,
        undefined,
        abi.custom,
        { addr: activeAccount.address, sk: new Uint8Array(0) }
      );
      const builder = {
        newARC200: new CONTRACT(
          selectedContract.contractId,
          algodClient,
          undefined,
          {
            name: "ARC200Token",
            methods: [
              {
                name: "mint",
                args: [
                  { type: "address", name: "to" },
                  { type: "byte[32]", name: "hash" },
                  { type: "byte[8]", name: "symbol" },
                  { type: "uint8", name: "decimals" },
                  { type: "uint256", name: "supply" },
                ],
                returns: { type: "void" },
              },
            ],
            events: [],
          },
          { addr: activeAccount.address, sk: new Uint8Array(0) },
          true,
          false,
          true
        ),
        fTok: new CONTRACT(
          302222,
          algodClient,
          undefined,
          abi.arc200,
          { addr: activeAccount.address, sk: new Uint8Array(0) },
          true,
          false,
          true
        ),
      };
      const buildN = [];
      {
        const txnO = (
          await builder.newARC200.mint(
            activeAccount.address,
            new Uint8Array(Buffer.from(name.padEnd(32, "\0"), "utf8")),
            new Uint8Array(Buffer.from(symbol.padEnd(8, "\0"), "utf8")),
            Number(decimals),
            BigInt(
              new BigNumber(totalSupply)
                .multipliedBy(Math.pow(10, Number(decimals)))
                .toFixed(0)
            )
          )
        ).obj;
        buildN.push({
          ...txnO,
          payment: 1000000 + 31300,
          note: new TextEncoder().encode(
            `arc200 mint ${name} ${symbol} ${decimals} ${totalSupply} ${activeAccount.address}`
          ),
        });
      }
      {
        const txnO = (
          await builder.fTok.arc200_transfer(
            "G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ",
            1000 * 1e6
          )
        ).obj;
        buildN.push({
          ...txnO,
          payment: 28500,
          note: new TextEncoder().encode(
            "arc200_transfer 1000 F to G3MSA75OZEJTCCENOJDLDJK7UD7E2K5DNC7FVHCNOV7E3I4DTXTOWDUIFQ"
          ),
        });
      }
      /*
      builder.newARC200.setFee(3000);
      builder.newARC200.setPaymentAmount(1000000 + 31300);
      const mintR = await builder.newARC200.mint(
        activeAccount.address,
        new Uint8Array(Buffer.from(name.padEnd(32, "\0"), "utf8")),
        new Uint8Array(Buffer.from(symbol.padEnd(8, "\0"), "utf8")),
        Number(decimals),
        BigInt(
          new BigNumber(totalSupply)
            .multipliedBy(Math.pow(10, Number(decimals)))
            .toFixed(0)
        )
      );
      console.log({ mintR });
      */
      ci.setFee(2000);
      ci.setEnableGroupResourceSharing(true);
      ci.setExtraTxns(buildN);
      const customR = await ci.custom();

      console.log({ customR });
      if (!customR.success) {
        throw new Error("Token creation failed in mint");
      }

      const stxns = await signTransactions(
        customR.txns.map(
          (txn: string) => new Uint8Array(Buffer.from(txn, "base64"))
        )
      );

      const { txId } = await algodClient
        .sendRawTransaction(stxns as Uint8Array[])
        .do();

      await waitForConfirmation(algodClient, txId, 4);

      setTxnId(txId);
      setTxnMsg(`Token ${name} (${symbol}) created successfully!`);
      resetForm();
      toast.success("Token created successfully!");
    } catch (error) {
      console.error("Error creating token:", error);
      toast.error("Failed to create token");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setSymbol("");
    setTotalSupply("1000000");
    setDecimals("6");
  };

  const handleCreateClick = () => {
    if (!activeAccount) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!name || !symbol || !totalSupply || !decimals || !selectedContract) {
      toast.error("Please fill in all fields");
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setShowConfirmation(false);
    await handleCreateToken();
  };

  return (
    <Layout>
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <FormContainer $isDarkTheme={isDarkTheme}>
          <PageTitle variant="h4" sx={{ mb: 4 }} $isDarkTheme={isDarkTheme}>
            Create ARC-200 Token
          </PageTitle>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <StyledFormLabel $isDarkTheme={isDarkTheme}>
                  Contract Address
                </StyledFormLabel>
                <Autocomplete
                  value={selectedContract}
                  onChange={(_, newValue) => setSelectedContract(newValue)}
                  options={contracts}
                  loading={isLoadingContracts}
                  getOptionLabel={(option) => `${option.contractId}`}
                  renderInput={(params) => (
                    <ShadedInput
                      {...params}
                      placeholder="Select contract"
                      fullWidth
                      sx={{
                        "& .MuiInputBase-input": {
                          color: isDarkTheme ? "#fff" : "inherit",
                        },
                        "& .MuiInputLabel-root": {
                          color: isDarkTheme ? "#fff" : "inherit",
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <ContractIdDisplay>
                        <ContractId>
                          Contract ID: {option.contractId}
                        </ContractId>
                        <ContractAddress>
                          Address: {option.address}
                        </ContractAddress>
                      </ContractIdDisplay>
                    </Box>
                  )}
                />
                <HelperText $isDarkTheme={isDarkTheme}>
                  Select token contract address to use
                </HelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputHeader $isDarkTheme={isDarkTheme}>
                  <StyledFormLabel $isDarkTheme={isDarkTheme}>
                    Token Name
                  </StyledFormLabel>
                </InputHeader>
                <ShadedInput
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.value.length <= MAX_NAME_LENGTH) {
                      setName(e.target.value);
                    }
                  }}
                  placeholder="e.g., My Token"
                  fullWidth
                  error={name.length === MAX_NAME_LENGTH}
                  sx={{
                    "& .MuiInputBase-input": {
                      color: isDarkTheme ? "#fff" : "inherit",
                    },
                    "& .MuiInputLabel-root": {
                      color: isDarkTheme ? "#fff" : "inherit",
                    },
                  }}
                />
                <CharacterCount
                  $isDarkTheme={isDarkTheme}
                  $isAtLimit={name.length === MAX_NAME_LENGTH}
                >
                  {name.length} / {MAX_NAME_LENGTH} characters
                </CharacterCount>
                <HelperText $isDarkTheme={isDarkTheme}>
                  The full name of your token
                </HelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputHeader $isDarkTheme={isDarkTheme}>
                  <StyledFormLabel $isDarkTheme={isDarkTheme}>
                    Token Symbol
                  </StyledFormLabel>
                </InputHeader>
                <ShadedInput
                  value={symbol}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const upperValue = e.target.value.toUpperCase();
                    if (upperValue.length <= MAX_SYMBOL_LENGTH) {
                      setSymbol(upperValue);
                    }
                  }}
                  placeholder="e.g., MTK"
                  fullWidth
                  error={symbol.length === MAX_SYMBOL_LENGTH}
                  sx={{
                    "& .MuiInputBase-input": {
                      color: isDarkTheme ? "#fff" : "inherit",
                    },
                    "& .MuiInputLabel-root": {
                      color: isDarkTheme ? "#fff" : "inherit",
                    },
                  }}
                />
                <CharacterCount
                  $isDarkTheme={isDarkTheme}
                  $isAtLimit={symbol.length === MAX_SYMBOL_LENGTH}
                >
                  {symbol.length} / {MAX_SYMBOL_LENGTH} characters
                </CharacterCount>
                <HelperText $isDarkTheme={isDarkTheme}>
                  A short identifier for your token (uppercase)
                </HelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <StyledFormLabel $isDarkTheme={isDarkTheme}>
                  Total Supply
                </StyledFormLabel>
                <ShadedInput
                  value={totalSupply}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTotalSupply(e.target.value)
                  }
                  type="number"
                  fullWidth
                  sx={{
                    "& .MuiInputBase-input": {
                      color: isDarkTheme ? "#fff" : "inherit",
                    },
                    "& .MuiInputLabel-root": {
                      color: isDarkTheme ? "#fff" : "inherit",
                    },
                  }}
                />
                <HelperText $isDarkTheme={isDarkTheme}>
                  The total number of tokens to create
                </HelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <StyledFormLabel $isDarkTheme={isDarkTheme}>
                  Decimals
                </StyledFormLabel>
                <ShadedInput
                  value={decimals}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setDecimals(e.target.value)
                  }
                  type="number"
                  fullWidth
                  sx={{
                    "& .MuiInputBase-input": {
                      color: isDarkTheme ? "#fff" : "inherit",
                    },
                    "& .MuiInputLabel-root": {
                      color: isDarkTheme ? "#fff" : "inherit",
                    },
                  }}
                />
                <HelperText $isDarkTheme={isDarkTheme}>
                  Number of decimal places (6 recommended)
                </HelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateClick}
                disabled={isSubmitting}
                fullWidth
                size="large"
                sx={{
                  height: "48px",
                  fontSize: "16px",
                  fontWeight: 600,
                  mt: 2,
                }}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting ? "Creating Token..." : "Create Token"}
              </Button>
            </Grid>
          </Grid>
        </FormContainer>
      </Container>

      <Container maxWidth="xl" sx={{ mt: 4, px: { xs: 2, sm: 3 } }}>
        <TokenList tokens={tokens} />
      </Container>

      <StyledDialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        maxWidth="sm"
        fullWidth
        $isDarkTheme={isDarkTheme}
      >
        <StyledDialogTitle $isDarkTheme={isDarkTheme}>
          Confirm Token Creation
        </StyledDialogTitle>
        <DialogContent>
          <Typography
            variant="body1"
            gutterBottom
            sx={{
              color: isDarkTheme ? "#fff" : "inherit",
              opacity: isDarkTheme ? 0.9 : 1,
            }}
          >
            You are about to create a new ARC-200 token with the following
            details:
          </Typography>

          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: isDarkTheme
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(0, 0, 0, 0.02)",
              borderRadius: "8px",
            }}
          >
            <Typography
              variant="body2"
              gutterBottom
              sx={{
                color: isDarkTheme
                  ? "rgba(255, 255, 255, 0.9)"
                  : "inherit",
                "& > span": {
                  color: isDarkTheme ? "#fff" : "inherit",
                  fontWeight: 600,
                },
              }}
            >
              <span>Name:</span> {name}
              <br />
              <span>Symbol:</span> {symbol}
              <br />
              <span>Total Supply:</span> {totalSupply}
              <br />
              <span>Decimals:</span> {decimals}
            </Typography>
          </Box>

          <CostBreakdown>
            <CostTitle variant="subtitle2" $isDarkTheme={isDarkTheme}>
              Cost Breakdown:
            </CostTitle>

            <CostItem $isDarkTheme={isDarkTheme}>
              <CostLabel $isDarkTheme={isDarkTheme}>
                Creation Fee
              </CostLabel>
              <CostValue $isDarkTheme={isDarkTheme}>1.0313 VOI</CostValue>
            </CostItem>

            <CostItem $isDarkTheme={isDarkTheme}>
              <CostLabel $isDarkTheme={isDarkTheme}>
                Factory Fee
              </CostLabel>
              <CostValue $isDarkTheme={isDarkTheme}>1000 F</CostValue>
            </CostItem>

            <CostItem $isDarkTheme={isDarkTheme}>
              <CostLabel $isDarkTheme={isDarkTheme}>Total Cost</CostLabel>
              <CostValue $isDarkTheme={isDarkTheme}>
                1.0313 VOI + 1000 F
              </CostValue>
            </CostItem>

            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: isDarkTheme
                  ? "rgba(255, 255, 255, 0.7)"
                  : "text.secondary",
                textAlign: "center",
              }}
            >
              Need F tokens? Get them{" "}
              <StyledLink
                to="https://voi.humble.sh/#/swap?poolId=395510"
                target="_blank"
              >
                here
              </StyledLink>
            </Typography>
          </CostBreakdown>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setShowConfirmation(false)}
            disabled={isSubmitting}
            sx={{
              color: isDarkTheme ? "rgba(255, 255, 255, 0.7)" : undefined,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? <CircularProgress size={20} /> : null
            }
          >
            {isSubmitting ? "Creating..." : "Confirm & Create"}
          </Button>
        </DialogActions>
      </StyledDialog>

      <TransactionDetails
        id={txnId}
        show={Boolean(txnId)}
        onClose={() => setTxnId("")}
        msg={txnMsg}
      />
    </Layout>
  );
};

export default CreateARC200;
