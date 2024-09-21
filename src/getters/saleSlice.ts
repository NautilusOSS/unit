// reducers.ts
import axios from "axios";
import db from "../db";
import { SaleI, NFTIndexerSaleI } from "../types";
import { ARC72_INDEXER_API } from "../config/arc72-idx";

export interface SalesState {
  sales: SaleI[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export const getSales = async() => {
  try {
    const saleTable = db.table("sales");
    const sales = await saleTable.toArray();
    const lastRound =
      sales.length > 0
        ? Math.max(...sales.map((sale: SaleI) => sale.round))
        : 0;
    const response = await axios.get(
      `${ARC72_INDEXER_API}/nft-indexer/v1/mp/sales`,
      {
        params: {
          "min-round": lastRound,
        },
      }
    );
    const newsales = response.data.sales.filter(
      (sale: NFTIndexerSaleI) => sale.round > lastRound
    );
    console.log({ newsales });
    await db.table("sales").bulkPut(
      newsales.map((sale: SaleI) => {
        return {
          pk: `${sale.mpContractId}-${sale.mpListingId}`,
          transactionId: sale.transactionId,
          mpContractId: sale.mpContractId,
          mpListingId: sale.mpListingId,
          tokenId: sale.tokenId,
          seller: sale.seller,
          buyer: sale.buyer,
          currency: sale.currency,
          price: sale.price,
          round: sale.round,
          timestamp: sale.timestamp,
          collectionId: sale.collectionId,
        };
      })
    );
    return [...sales, ...newsales].map((sale: any) => sale) as SaleI[];
  } catch (error: any) {
    return console.error(error.message);
  }
}

