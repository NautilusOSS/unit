// reducers.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { CONTRACT, abi, swap } from "ulujs";
import { getAlgorandClients } from "../wallets";
import BigNumber from "bignumber.js";

export interface DexState {
  prices: any[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export const getPrices = createAsyncThunk<
  any[],
  void,
  { rejectValue: string; state: RootState }
>("dex/getPrices", async (_, { getState, rejectWithValue }) => {
  try {
    /*
    const ctcInfo = 34099095; // wVOI2/VIA
    const { algodClient, indexerClient } = getAlgorandClients();
    const ci = new swap(ctcInfo, algodClient, indexerClient);
    const InfoR = await ci.Info();
    if (!InfoR.success) {
      throw new Error(InfoR.error);
    }
    const Info = InfoR.returnValue;
    const {
      poolBals: [balA, balB],
    } = Info;
    const balABn = new BigNumber(balA);
    const balBBn = new BigNumber(balB);
    const rateSU = balABn.dividedBy(balBBn).toNumber();
    const prices = [
      {
        contractId: ctcInfo,
        tokA: "wVOI",
        tokB: "VIA",
        rate: rateSU,
      },
    ];
    return prices;
    */
    const prices = [
      {
        contractId: 34099095,
        tokA: "wVOI2",
        tokB: "VIA",
        rate: 1,
      },
    ];
    return prices;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const initialState: DexState = {
  prices: [],
  status: "idle",
  error: null,
};

const dexSlice = createSlice({
  name: "prices",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPrices.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getPrices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.prices = [...action.payload];
      })
      .addCase(getPrices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default dexSlice.reducer;
