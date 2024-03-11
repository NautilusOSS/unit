import React from "react";
import { WalletProvider, useInitializeProviders } from "@txnlab/use-wallet";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";
import Navbar from "./components/Navbar";
import { routes } from "./routes";
import {
  getProviderInit,
} from "./wallets";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App: React.FC = () => {
  const providers = useInitializeProviders(getProviderInit());
  return (
    <WalletProvider value={providers}>
      <Provider store={store}>
        <Router>
          <Navbar />
          <Routes>
            {routes.map((el) => (
              <Route path={el.path} Component={el.Component} />
            ))}
          </Routes>
        </Router>
      </Provider>
      <ToastContainer />
    </WalletProvider>
  );
};

export default App;
