export const TESTNET = {
    id: 1,
    name: "Testnet",
    network: "testnet", // Ajoute cette ligne
    nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18
    },
    rpcUrls: {
        default: {
            http: ["https://testnet-rpc-url"]
        },
        public: {
            http: ["https://public-testnet-rpc-url"]
        }
    }
};
