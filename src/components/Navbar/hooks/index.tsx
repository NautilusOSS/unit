import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@txnlab/use-wallet";

export const useAccountInfo = () => {
    const { providers, activeAccount,  getAccountInfo } =
  useWallet();
  const data = useQuery({
    queryFn: () => {
      if (activeAccount && providers && providers.length >= 3) {
        return getAccountInfo();
      }
      return null;
    },
    queryKey: ["accountInfo", activeAccount?.address, providers?.length],
  });
  return data;
};
