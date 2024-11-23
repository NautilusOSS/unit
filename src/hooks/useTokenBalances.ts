import { useWallet } from "@txnlab/use-wallet-react";
import { useState, useEffect, useCallback } from "react";
import { TokenConfig } from "../config/tokens";
import { abi, CONTRACT } from "ulujs";
import { getAlgorandClients } from "@/wallets";

interface TokenBalances {
  arc200Balance: string;
  asaBalance: string;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const formatBalance = (balance: string, decimals: number): string => {
  const num = BigInt(balance);
  const divisor = BigInt(10 ** decimals);
  const integerPart = num / divisor;
  const fractionalPart = num % divisor;
  const paddedFractional = fractionalPart.toString().padStart(decimals, "0");
  return `${integerPart}.${paddedFractional}`;
};

export const useTokenBalances = (token: TokenConfig | null): TokenBalances => {
  const { activeAccount } = useWallet();
  const [balances, setBalances] = useState<Omit<TokenBalances, 'refetch'>>({
    arc200Balance: "0",
    asaBalance: "0",
    loading: false,
    error: null,
  });

  const fetchBalances = useCallback(async () => {
    if (!token || !activeAccount) {
      return;
    }
    setBalances((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { algodClient, indexerClient } = getAlgorandClients();
      // fetch ARC200 balance
      const ci = new CONTRACT(
        token.arc200AppId,
        algodClient,
        indexerClient,
        abi.nt200,
        { addr: activeAccount.address, sk: new Uint8Array() }
      );
      const arc200_balanceOfR = await ci.arc200_balanceOf(
        activeAccount.address
      );
      if (!arc200_balanceOfR.success) {
        throw new Error("Failed to fetch ARC200 balance");
      }
      const arc200_balanceOf = arc200_balanceOfR.returnValue;
      // fetch ASA balance
      const asa_balanceOfR = await indexerClient
        .lookupAccountAssets(activeAccount.address)
        .do();
      const asa_balanceOf =
        asa_balanceOfR.assets?.find(
          (asset: any) => asset["asset-id"] === token.asaAssetId
        )?.amount || 0;
      setBalances({
        arc200Balance: formatBalance(
          arc200_balanceOf.toString(),
          token.decimals
        ),
        asaBalance: formatBalance(asa_balanceOf.toString(), token.decimals),
        loading: false,
        error: null,
      });
    } catch (error) {
      setBalances({
        arc200Balance: "0",
        asaBalance: "0",
        loading: false,
        error: "Failed to fetch balances",
      });
    }
  }, [token, activeAccount]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return { ...balances, refetch: fetchBalances };
};
