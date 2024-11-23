import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { store, persistor } from "./store/store";
import { PersistGate } from "redux-persist/integration/react";
import { routes } from "./routes";
import { getCurrentNodeEnv } from "./wallets";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  NetworkId,
  WalletId,
  WalletManager,
  WalletProvider,
} from "@txnlab/use-wallet-react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./theme";
import UnitLayout from "./layouts/UnitLayout";
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';

// New component that uses the wallet hook
const AppRoutes: React.FC = () => {
  return (
    <UnitLayout>
      <Routes>
        {routes.map((el, key) => (
          <Route
            key={key}
            path={el.path}
            element={<el.Component />}
          />
        ))}
      </Routes>
    </UnitLayout>
  );
};

const queryClient = new QueryClient();

const App: React.FC = () => {
  const { ALGO_SERVER } = getCurrentNodeEnv();

  const walletConnectProjectId = "cd7fe0125d88d239da79fa286e6de2a8";

  const walletManager = new WalletManager({
    wallets: [
      WalletId.KIBISIS,
      {
        id: WalletId.LUTE,
        options: { siteName: "Unit Token" },
      },
      {
        id: WalletId.BIATEC,
        options: {
          projectId: walletConnectProjectId,
          metadata: {
            name: "Unit Token",
            url: "https://unit.voi",
            description: "Unit Token Name Service",
            icons: ["https://unit.voi/favicon.ico"],
          },
          themeMode: "light",
        },
      },
      {
        id: WalletId.WALLETCONNECT,
        options: {
          projectId: walletConnectProjectId,
          metadata: {
            name: "Unit Token",
            url: "https://unit.voi",
            description: "Unit Token Name Service",
            icons: ["https://unit.voi/favicon.ico"],
          },
          themeMode: "light",
        },
      },
    ],
    algod: {
      baseServer: ALGO_SERVER,
      port: "",
      token: "",
    },
    network: NetworkId.MAINNET,
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CustomThemeProvider>
        <WalletProvider manager={walletManager}>
          <QueryClientProvider client={queryClient}>
            <Provider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <Router>
                  <AppRoutes />
                </Router>
              </PersistGate>
            </Provider>
            <ToastContainer />
          </QueryClientProvider>
        </WalletProvider>
      </CustomThemeProvider>
    </ThemeProvider>
  );
};

export default App;
