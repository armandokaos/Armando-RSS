import { createPublicClient, createWalletClient, http, parseGwei } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import "dotenv/config";
import { grc20Testnet } from "./testnet.js";

const spaceId = "VoNCdYgAuRjEYgsRrzQ5W4NC"; // 🔥 ID FIXE DE TON SPACE

export async function publishPressRelease(ipfsHash: string): Promise<string> {
  const author = process.env.WALLET_ADDRESS;
  if (!author) throw new Error("WALLET_ADDRESS not set in environment");
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY not set in environment");

  const rpcUrl = process.env.RPC_URL || grc20Testnet.rpcUrls.default.http[0];
  if (!rpcUrl) throw new Error("No RPC URL configured. Set RPC_URL in .env file.");

  console.log("[1️⃣] Getting calldata from API...");
  const result = await fetch(`https://api-testnet.grc-20.thegraph.com/space/${spaceId}/edit/calldata`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cid: ipfsHash, network: "TESTNET" }),
  });
  if (!result.ok) {
    throw new Error(`Error fetching calldata: ${result.statusText}`);
  }
  const { to, data } = await result.json();

  console.log("[2️⃣] Sending transaction to blockchain...");
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

  console.log("[✅] Transaction submitted:", hash);
  return hash;
}

// 🔥 EXÉCUTION DIRECTE SI UTILISÉ AVEC `bun run publishPressRelease.ts`
if (process.argv.length > 2) {
  const ipfsHash = process.argv[2]; // Récupération du IPFS Hash en argument

  if (!ipfsHash) {
    console.error("❌ ERROR: You must provide an IPFS Hash.");
    process.exit(1);
  }

  publishPressRelease(ipfsHash)
    .then((txHash) => {
      console.log("🔗 Transaction Hash:", txHash);
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Error:", err);
      process.exit(1);
    });
}
