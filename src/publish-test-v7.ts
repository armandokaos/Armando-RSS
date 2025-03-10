// publish-test-v7.ts
import { createWalletClient, http, parseGwei } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import "dotenv/config";
import { grc20Testnet } from "./testnet.js";

/**
 * Publishes the IPFS edit from write-test-v7.ts on-chain.
 * Now we have a correct union type for the ops,
 * so no more "type SET_TRIPLE is not assignable to type CREATE_RELATION"
 */

const spaceId = "NCdYgAuRjEYgsRrzQ5W4NC";
const ipfsHash = process.argv[2];

if (!ipfsHash) {
  console.error("❌ ERROR: You must pass an IPFS Hash from write-test-v7.ts.");
  process.exit(1);
}

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error("❌ ERROR: PRIVATE_KEY is missing in .env file.");
  process.exit(1);
}

const rpcUrl = process.env.RPC_URL || grc20Testnet.rpcUrls.default.http[0];
if (!rpcUrl) {
  console.error("❌ ERROR: RPC_URL missing in .env file.");
  process.exit(1);
}

const account = privateKeyToAccount(`0x${privateKey}`);
const walletClient = createWalletClient({
  account,
  chain: grc20Testnet,
  transport: http(rpcUrl),
});

async function publishTestV7() {
  console.log(`[1️⃣] Fetching calldata from API for Space ${spaceId} edit...`);

  const apiUrl = `https://api-testnet.grc-20.thegraph.com/space/${spaceId}/edit/calldata`;
  const payload = {
    spaceId,
    cid: ipfsHash.startsWith("ipfs://") ? ipfsHash : `ipfs://${ipfsHash}`,
    network: "TESTNET",
  };

  console.log("🔍 DEBUG: payload:", JSON.stringify(payload, null, 2));
  console.log("🔍 DEBUG: API URL:", apiUrl);

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ ERROR: Request failed.");
      console.error("[DEBUG] status:", res.status);
      console.error("[DEBUG] body:", errText);
      throw new Error(`API Error: ${errText}`);
    }

    const { to, data } = await res.json();
    console.log("[DEBUG] 'to':", to);
    console.log("[DEBUG] 'data':", data);

    console.log("[2️⃣] Sending tx to blockchain...");

    const gasLimit = BigInt(13000000);
    const baseGasPrice = parseGwei("0.01");

    const tx = await walletClient.sendTransaction({
      chain: grc20Testnet,
      to,
      data: data.startsWith("0x") ? data : `0x${data}`,
      gas: gasLimit,
      maxFeePerGas: baseGasPrice,
      maxPriorityFeePerGas: baseGasPrice,
      value: BigInt(0),
    });

    console.log("[✅] Transaction submitted:", tx);
    return tx;
  } catch (error) {
    console.error("❌ ERROR:", error);
    process.exit(1);
  }
}

publishTestV7()
  .then((txHash) => {
    console.log("🔗 Transaction Hash:", txHash);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ ERROR:", err);
    process.exit(1);
  });
