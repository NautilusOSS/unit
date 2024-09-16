// reducers.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import db from "../db";
import { RootState } from "./store";
import { ListingI, NFTIndexerListingI } from "../types";
import { ARC72_INDEXER_API } from "../config/arc72-idx";

export interface ListingsState {
  listings: ListingI[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const blacklistContracts = [
  64750401, 65263044, 65263806, 65264863, 65267786, 65269093, 65269789,
  65271249, 65272067, 65272857, 65273789, 65274796, 65275375, 65275914,
  65276428, 65277198, 65277784, 65278193, 65738852, 65740742, 65741177,
  65742825, 66083952, 66086246, 66086647, 66087573, 66088505, 66089076,
  66089616, 66090583, 66091276, 66092220, 66093127, 66441968, 66443508,
  66446263, 66446871, 66447335, 66447818, 66448415, 68310165, 68310861,
  68311402, 68312150, 68312977, 68342547, 68343237, 68343605, 68344187,
  68345023, 68345871, 64322825, 64326785, 64329232, 64330183, 64331863,
  64673858, 64676951, 64678053, 64678885, 64679998, 64682371, 64683048,
  64683709, 64684068, 64298995, 64301399, 64303368, 64304043, 64305862,
  64306817, 64308654, 64298388,
];

export const getListings = createAsyncThunk<
  ListingI[],
  void,
  { rejectValue: string; state: RootState }
>("listings/getListings", async (_, { getState, rejectWithValue }) => {
  try {
    //const listingTable = db.table("listings");
    //const listings = await listingTable.toArray();
    const lastRound = 0;
    // const lastRound =
    //   listings.length > 0
    //     ? Math.max(...listings.map((listing: ListingI) => listing.round))
    //     : 0;
    const response = await axios.get(
      `${ARC72_INDEXER_API}/nft-indexer/v1/mp/listings`,
      {
        params: {
          //"min-round": lastRound,
          active: true,
        },
      }
    );
    /*
    const response2 = await axios.get(
      `${ARC72_INDEXER_API}/nft-indexer/v1/mp/deletes`,
      {
        params: {
          "min-round": lastRound,
        },
      }
    );
    const response3 = await axios.get(
      `${ARC72_INDEXER_API}/nft-indexer/v1/mp/sales`,
      {
        params: {
          "min-round": lastRound,
        },
      }
    );
    */

    const newlistings = response.data.listings.filter(
      (listing: NFTIndexerListingI) =>
        listing.createRound > lastRound &&
        !blacklistContracts.includes(listing.collectionId)
    );

    /*
    const deletedListingsToDelete = response2.data.deletes
      .filter((deleted: any) => deleted.round > lastRound)
      .map((deleted: any) => `${deleted.mpContractId}-${deleted.mpListingId}`);

    const soldListingsToDelete = response3.data.sales
      .filter((sale: any) => sale.round > lastRound)
      .map((sale: any) => `${sale.mpContractId}-${sale.mpListingId}`);
      */

    await db.table("listings").bulkPut(
      newlistings.map((listing: NFTIndexerListingI) => {
        return {
          pk: `${listing.mpContractId}-${listing.mpListingId}`,
          mpContractId: listing.mpContractId,
          mpListingId: listing.mpListingId,
          tokenId: listing.tokenId,
          seller: listing.seller,
          currency: listing.currency,
          price: listing.price,
          round: listing.createRound,
          timestamp: listing.createTimestamp,
          collectionId: listing.collectionId,
          endTimestamp: listing.endTimestamp,
          royalty: listing.royalty,
        } as ListingI;
      })
    );

    await db.table("tokens").bulkPut(
      newlistings.map((listing: NFTIndexerListingI) => {
        return {
          pk: `${listing.token.contractId}-${listing.token.tokenId}`,
          owner: listing.token.owner,
          approved: listing.token.approved,
          tokenId: listing.token.tokenId,
          contractId: listing.token.contractId,
          mintRound: listing.token.mintRound,
          metadataURI: listing?.token?.metadataURI || "",
          metadata: listing.token?.metadata,
        };
      })
    );

    //await db.table("listings").bulkDelete(soldListingsToDelete);
    //await db.table("listings").bulkDelete(deletedListingsToDelete);

    return [
      //...listings,
      ...newlistings,
    ]
      .reverse()
      .map((listing: any) => listing) as ListingI[];
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const initialState: ListingsState = {
  listings: [],
  status: "idle",
  error: null,
};

const listingSlice = createSlice({
  name: "listings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getListings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getListings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.listings = [...action.payload];
      })
      .addCase(getListings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default listingSlice.reducer;
