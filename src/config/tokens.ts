export interface TokenConfig {
  name: string;
  arc200AppId: number;
  asaAssetId: number;
  unitAppId: number;
  decimals: number;
}

export const TOKENS: Record<string, TokenConfig> = {
  unit: {
    name: "Unit Token",
    arc200AppId: 420069,
    asaAssetId: 747374,
    unitAppId: 747368,
    decimals: 8,
  },
  // Add more tokens here as needed
};
