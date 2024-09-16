import React from "react";
import styled from "styled-components";
import Footer from "../components/Footer";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const LayoutRoot = styled.div`
  padding: 0px 40px;
  padding-bottom: 40px;
  @media (max-width: 600px) {
    padding: 0px 10px;
    padding-bottom: 80px;
  }
`;

interface LayoutProps {
  children: React.ReactNode;
}
const queryClient = new QueryClient();

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );

  const theme = isDarkTheme ? "dark" : "light";
  return (
    <>
      <LayoutRoot
        className={`${theme}`}
        style={{ background: isDarkTheme ? "rgb(22, 23, 23)" : undefined }}
      >
        <QueryClientProvider client={queryClient}>
          <header></header>
          <main>{children}</main>
        </QueryClientProvider>
      </LayoutRoot>
      <Footer />
    </>
  );
};

export default Layout;
