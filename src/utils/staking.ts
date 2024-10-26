import { AIRDROP_FUNDING } from "@/contants/staking";
import { ListingI } from "@/types";
import algosdk from "algosdk";
import { CONTRACT } from "ulujs";

export const computeListingDiscount = (listing: ListingI) => {
  if (!listing.rewards || !listing) return 0;
  const { rewards } = listing;
  ((Number(rewards.total || listing.staking.global_total) -
    Number(listing.price / 1e6)) /
    Number(rewards.total || listing.staking.global_total)) *
    100;
};

export const getStakingUnlockTime = (stakingContract: any) => {
  return (
    (stakingContract.funding || AIRDROP_FUNDING) +
    getStakingLockupTime(stakingContract) +
    getStakingVestingTime(stakingContract)
  );
};

export const getStakingTotalTokens = (stakingContract: any) => {
  const total = Number(stakingContract.global_total);
  const initial = Number(stakingContract.global_initial);
  return total > initial ? total / 1e6 : initial / 1e6;
};

export const getStakingVestingTime = (stakingContract: any) => {
  return (
    stakingContract.global_distribution_count *
    stakingContract.global_distribution_seconds
  );
};

export const getStakingLockupTime = (stakingContract: any) => {
  return (
    (stakingContract.global_lockup_delay * stakingContract.global_period +
      stakingContract.global_vesting_delay) *
    stakingContract.global_period_seconds
  );
};

export const getStakingWithdrawableAmount = async (
  algodClient: any,
  apid: number,
  owner: string
) => {
  const { amount, ["min-balance"]: minBalance } = await algodClient
    .accountInformation(algosdk.getApplicationAddress(apid))
    .do();
  const availableBalance = amount - Number(minBalance);
  const ci = new CONTRACT(
    apid,
    algodClient,
    undefined,
    {
      name: "AirdropClient",
      methods: [
        {
          name: "withdraw",
          args: [
            {
              type: "uint64",
              name: "amount",
            },
          ],
          readonly: false,
          returns: {
            type: "uint64",
          },
          desc: "Withdraw funds from contract.",
        },
      ],
      events: [],
    },
    {
      addr: owner,
      sk: new Uint8Array(0),
    }
  );
  ci.setFee(3000);
  const withdrawR = await ci.withdraw(0);
  if (!withdrawR.success) {
    throw new Error("withdraw failed in simulate");
  }
  const withdraw = withdrawR.returnValue;
  const withdrawableBalance = BigInt(availableBalance) - BigInt(withdraw);
  return withdrawableBalance;
};
