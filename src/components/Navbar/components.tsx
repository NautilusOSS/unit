import { useWallet } from '@txnlab/use-wallet';
import React from 'react'

export const Profile = () => {
    const { providers, activeAccount, connectedAccounts, getAccountInfo } =
    useWallet();
  return (
    <>
        {activeAccount && accInfo ? (
            <StyledLink to={`/account/${activeAccount?.address}`}>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <div
                  style={{
                    color: isDarkTheme ? "#717579" : undefined,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      display: { xs: "none", sm: "flex" },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <img src={VOIIcon} style={{ height: "12px" }} />
                      <div>
                        {(
                          (accInfo.amount - accInfo["min-balance"]) /
                          1e6
                        ).toLocaleString()}{" "}
                        VOI
                      </div>
                    </Stack>
                    {/*<Stack
                      direction="row"
                      spacing={0.5}
                      sx={{
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <img src={VIAIcon} style={{ height: "12px" }} />
                      <div>{(balance / 1e6).toLocaleString()} VIA</div>
                    </Stack>*/}
                  </Stack>
                </div>
              </Stack>
            </StyledLink>
          ) : null}
          <AccountContainer>
            {activeAccount ? (
              <Link to={`/account/${activeAccount?.address}`}>
                <AccountIconContainer>
                  <AccountIcon />
                </AccountIconContainer>
              </Link>
            ) : null}
            <div className="hidden md:block">
              <ConnectWallet />
            </div>
          </AccountContainer>
    </>
  )
}
