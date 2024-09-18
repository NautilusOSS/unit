// reducers.ts
import axios from "axios";
import db from "../db";
import { CollectionI, NFTIndexerCollectionI } from "../types";
import { ARC72_INDEXER_API } from "../config/arc72-idx";


export const getCollections = async() => {
  try {
    const collectionTable = db.table("collections");
    const collections = await collectionTable.toArray();
    const lastRound =
      collections.length > 0
        ? Math.max(
            ...collections.map(
              (collection: CollectionI) => collection.mintRound
            )
          )
        : 0;
    const response = await axios.get(
      `${ARC72_INDEXER_API}/nft-indexer/v1/collections`,
      {
        params: {
          "mint-min-round": lastRound,
        },
      }
    );
    const newCollections = response.data.collections.filter(
      (collection: NFTIndexerCollectionI) => collection.mintRound > lastRound
    );
    await db.table("collections").bulkPut(
      newCollections.map((collection: CollectionI) => {
        return {
          pk: `${collection.contractId}`,
          contractId: collection.contractId,
          totalSupply: collection.totalSupply,
          isBlacklisted: collection.isBlacklisted,
          mintRound: collection.mintRound,
        };
      })
    );
    return [...collections, ...newCollections].map(
      (collection: any) => collection
    ) as CollectionI[];
  } catch (error: any) {
    return (error.message);
  }
};
