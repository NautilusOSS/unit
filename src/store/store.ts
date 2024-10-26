import { combineReducers, configureStore } from "@reduxjs/toolkit";
import themeReducer, { ThemeState } from "./themeSlice";
import tokenReducer, { TokensState } from "./tokenSlice";
import smartTokenReducer, { SmartTokensState } from "./smartTokenSlice";
import collectionReducer, { CollectionsState } from "./collectionSlice";
import saleReducer, { SalesState } from "./saleSlice";
import dexReducer, { DexState } from "./dexSlice";
import listingReducer, { ListingsState } from "./listingSlice";
import storage from "redux-persist/lib/storage"; // Defaults to localStorage for web
import { persistStore, persistReducer } from "redux-persist";
import cartReducer from './slices/cartSlice';

export type RootState = {
  tokens: TokensState;
  smartTokens: TokensState;
  collections: CollectionsState;
  sales: SalesState;
  listings: ListingsState;
  theme: ThemeState;
  dex: DexState;
};

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["theme"],
};

const rootReducer = combineReducers({
  theme: themeReducer,
  tokens: tokenReducer,
  smartTokens: smartTokenReducer,
  collections: collectionReducer,
  sales: saleReducer,
  listings: listingReducer,
  dex: dexReducer,
  cart: cartReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
