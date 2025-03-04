import { Ipfs } from "@graphprotocol/grc-20";
import { createPublicClient, createWalletClient, http, parseGwei } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import "dotenv/config";
// Configuration du réseau avec typage "any" pour éviter les problèmes liés à Chain.
const grc20Testnet = {
    id: 19411,
    name: "Geogenesis Testnet",
    network: "geogenesis-testnet",
    nativeCurrency: {
        decimals: 18,
        name: "ETH",
        symbol: "ETH",
    },
    rpcUrls: {
        default: { http: ["https://rpc-geo-test-zc16z3tcvf.t.conduit.xyz/"] },
        public: { http: ["https://rpc-geo-test-zc16z3tcvf.t.conduit.xyz/"] },
    },
};
export async function publishPressRelease(options) {
    const { spaceId, title, publishDate, webUrl, blocks, publisher } = options;
    const author = process.env.WALLET_ADDRESS;
    if (!author)
        throw new Error("WALLET_ADDRESS not set in environment");
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey)
        throw new Error("PRIVATE_KEY not set in environment");
    // Récupération du RPC URL depuis .env ou valeur par défaut
    const rpcUrl = process.env.RPC_URL || grc20Testnet.rpcUrls.default.http[0];
    if (!rpcUrl)
        throw new Error("No RPC URL configured. Set RPC_URL in .env file.");
    // Construction des opérations sans typage strict
    const ops = [
        {
            type: 1,
            triple: {
                entity: spaceId,
                attribute: "LuBWqZAu6pz54eiJS5mLv8",
                value: { type: 1, value: title },
            },
        },
        {
            type: 1,
            triple: {
                entity: spaceId,
                attribute: "KPNjGaLx5dKofVhT6Dfw22",
                value: { type: 5, value: publishDate },
            },
        },
        {
            type: 1,
            triple: {
                entity: spaceId,
                attribute: "93stf6cgYvBsdPruRzq1KK",
                value: { type: 4, value: webUrl },
            },
        },
        {
            type: 1,
            triple: {
                entity: spaceId,
                attribute: "QYbjCM6NT9xmh2hFGsqpQX",
                value: { type: 1, value: blocks },
            },
        },
        {
            type: 1,
            triple: {
                entity: spaceId,
                attribute: "Lc4JrkpMUPhNstqs7mvnc5",
                value: { type: 6, value: publisher },
            },
        },
    ];
    console.log("[IPFS] Publishing edit...");
    const cid = await Ipfs.publishEdit({ name: title, ops, author });
    console.log("[IPFS] Published edit:", cid);
    console.log("[API] Getting calldata...");
    const result = await fetch(`https://api-testnet.grc-20.thegraph.com/space/${spaceId}/edit/calldata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cid, network: "TESTNET" }),
    });
    if (!result.ok) {
        throw new Error(`Error fetching calldata: ${result.statusText}`);
    }
    const { to, data } = (await result.json());
    console.log("[API] Got calldata:", { to, dataLength: data.length });
    console.log("[Transaction] Sending transaction...");
    // Préfixe "0x" ajouté pour la clé privée, "to" et "data"
    const account = privateKeyToAccount(`0x${privateKey}`);
    const publicClient = createPublicClient({ chain: grc20Testnet, transport: http(rpcUrl) });
    const walletClient = createWalletClient({ account, chain: grc20Testnet, transport: http(rpcUrl) });
    const nonce = await publicClient.getTransactionCount({ address: account.address });
    const gasLimit = BigInt(13000000);
    const baseGasPrice = parseGwei("0.01");
    const hash = await walletClient.sendTransaction({
        chain: grc20Testnet,
        to: `0x${to}`,
        data: `0x${data}`,
        gas: gasLimit,
        maxFeePerGas: baseGasPrice,
        maxPriorityFeePerGas: baseGasPrice,
        nonce: nonce,
        value: BigInt(0),
    });
    console.log("[Transaction] Submitted:", hash);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("[Transaction] Confirmed:", receipt);
    return hash;
}
if (process.argv.includes("--run")) {
    publishPressRelease({
        spaceId: process.env.SPACE_ID || "",
        title: "Example Press Release",
        publishDate: "2025-03-01T12:00:00Z",
        webUrl: "https://example.com/press-release",
        blocks: "This is the content of the press release...",
        publisher: "Example Publisher",
    }).catch((err) => {
        console.error("Error:", err);
        process.exit(1);
    });
}
