import React from "react";
import PositionTable from "../PositionTable"; // Adjust the import path as necessary
import { useOwnedStakingContract } from "@/hooks/staking";
import { useWallet } from "@txnlab/use-wallet-react";
import { useOwnedARC72Token } from "@/hooks/arc72";
import PositionSummary from "../PositionSummary";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { TOKEN_NAUT_VOI_STAKING } from "@/contants/tokens";

const PositionContainer: React.FC = () => {
  const { activeAccount } = useWallet();
  const { isDarkTheme } = useSelector((state: RootState) => state.theme);
  const { data: stakingContractData, isLoading: stakingContractLoading } =
    useOwnedStakingContract(activeAccount?.address, {
      includeRewards: true,
      includeWithdrawable: true,
    });
  const { data: arc72TokenData, isLoading: arc72TokenLoading } =
    useOwnedARC72Token(activeAccount?.address, TOKEN_NAUT_VOI_STAKING, {
      includeStaking: true,
    });
  if (stakingContractLoading || arc72TokenLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div style={{ marginTop: "20px" }}>
      <PositionSummary
        stakingContracts={stakingContractData}
        arc72Tokens={arc72TokenData}
        isDarkTheme={isDarkTheme}
      />
      <PositionTable
        stakingContracts={stakingContractData}
        arc72Tokens={arc72TokenData}
        isDarkTheme={isDarkTheme}
      />
    </div>
  );
};

export default PositionContainer;
