import React, { useMemo, useState, useEffect, useCallback } from "react";
import PositionTable from "../PositionTable";
import { useOwnedStakingContract } from "@/hooks/staking";
import { useWallet } from "@txnlab/use-wallet-react";
import { useOwnedARC72Token } from "@/hooks/arc72";
import PositionSummary from "../PositionSummary";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { TOKEN_NAUT_VOI_STAKING } from "@/contants/tokens";
import { useInView } from "react-intersection-observer";

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

  // Infinite scroll setup
  const [displayCount, setDisplayCount] = useState(10);
  const { ref: loadMoreRef, inView } = useInView();

  const loadMore = useCallback(() => {
    if (!stakingContractLoading && !arc72TokenLoading) {
      setDisplayCount(prev => prev + 10);
    }
  }, [stakingContractLoading, arc72TokenLoading]);

  useEffect(() => {
    if (inView) {
      loadMore();
    }
  }, [inView, loadMore]);

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
        stakingContracts={stakingContractData?.slice(0, displayCount) || []}
        arc72Tokens={arc72TokenData?.slice(0, displayCount)}
      />
      
      {/* Invisible load more trigger */}
      {(stakingContractData?.length > displayCount || arc72TokenData?.length > displayCount) && (
        <div ref={loadMoreRef} style={{ height: "20px", margin: "20px 0" }} />
      )}
    </div>
  );
};

export default PositionContainer;
