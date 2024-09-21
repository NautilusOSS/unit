// reducers.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";


export interface DexState {
  prices: any[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export const getPrices = () => {
  try {
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

    return console.error(error.message);
  }
};

