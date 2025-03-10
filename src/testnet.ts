import type { Chain } from "viem";

export const TESTNET: Chain = {
  id: 1,
  name: "Testnet",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc-url"],
    },
    public: {
      http: ["https://public-testnet-rpc-url"],
    },
  },
};

export const grc20Testnet: Chain = {
  id: 19411,
  name: "Geogenesis Testnet",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc-geo-test-zc16z3tcvf.t.conduit.xyz/"] },
    public: { http: ["https://rpc-geo-test-zc16z3tcvf.t.conduit.xyz/"] },
  },
};
