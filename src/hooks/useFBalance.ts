import { useWallet } from "@txnlab/use-wallet-react";
import { useState, useEffect, useCallback } from "react";
import { getAlgorandClients } from "@/wallets";
import { abi, CONTRACT } from "ulujs";

interface FBalance {
  balance: string;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFBalance = (): FBalance => {
  const { activeAccount } = useWallet();
  const [balance, setBalance] = useState<Omit<FBalance, 'refetch'>>({
    balance: "0",
    loading: false,
    error: null,
  });

  const fetchBalance = useCallback(async () => {
    if (!activeAccount) {
      return;
    }
    setBalance((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { algodClient, indexerClient } = getAlgorandClients();
      const ci = new CONTRACT(
        302222, // F token contract ID
        algodClient,
        indexerClient,
        abi.arc200,
        { addr: activeAccount.address, sk: new Uint8Array() }
      );
      
      const balanceResponse = await ci.arc200_balanceOf(activeAccount.address);
      if (!balanceResponse.success) {
        throw new Error("Failed to fetch F balance");
      }

      const rawBalance = balanceResponse.returnValue;
      // F token has 6 decimals
      const formattedBalance = (Number(rawBalance) / 1e6).toString();

      setBalance({
        balance: formattedBalance,
        loading: false,
        error: null,
      });
    } catch (error) {
      setBalance({
        balance: "0",
        loading: false,
        error: "Failed to fetch F balance",
      });
    }
  }, [activeAccount]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { ...balance, refetch: fetchBalance };
}; 