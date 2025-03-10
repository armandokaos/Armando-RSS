// publish-test-v2.ts
import { createWalletClient, http, parseGwei } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import "dotenv/config";
import { grc20Testnet } from "./testnet.js";

const spaceId = "NCdYgAuRjEYgsRrzQ5W4NC";
const ipfsHash = process.argv[2];

if (!ipfsHash) {
  console.error("❌ ERROR: You must provide an IPFS Hash (the output of write-test-v2.ts).");
  process.exit(1);
}

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error("❌ ERROR: PRIVATE_KEY is missing in .env file.");
  process.exit(1);
}

const rpcUrl = process.env.RPC_URL || grc20Testnet.rpcUrls.default.http[0];
if (!rpcUrl) {
  console.error("❌ ERROR: RPC_URL is missing in .env file.");
  process.exit(1);
}

const account = privateKeyToAccount(`0x${privateKey}`);
const walletClient = createWalletClient({
  account,
  chain: grc20Testnet,
  transport: http(rpcUrl),
});

async function publishTestV2() {
  console.log(`[1️⃣] Fetching calldata from API for the edit in Space ${spaceId}...`);

  const apiUrl = `https://api-testnet.grc-20.thegraph.com/space/${spaceId}/edit/calldata`;
  const payload = {
    spaceId: spaceId,
    cid: ipfsHash.startsWith("ipfs://") ? ipfsHash : `ipfs://${ipfsHash}`,
    network: "TESTNET",
  };

  console.log("🔍 DEBUG: Payload:", JSON.stringify(payload, null, 2));
  console.log("🔍 DEBUG: API URL:", apiUrl);

  try {
    const result = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!result.ok) {
      const errorText = await result.text();
      console.error("❌ ERROR: API request failed.");
      console.error("[DEBUG] Status:", result.status);
      console.error("[DEBUG] Body:", errorText);
      throw new Error(`API Error: ${errorText}`);
    }

    const { to, data } = await result.json();
    console.log("[DEBUG] 'to' returned by API:", to);
    console.log("[DEBUG] 'data' returned by API:", data);

    console.log("[2️⃣] Sending transaction to the blockchain...");

    const gasLimit = BigInt(13000000);
    const baseGasPrice = parseGwei("0.01");

    const txResult = await walletClient.sendTransaction({
      chain: grc20Testnet,
      to,
      data: data.startsWith("0x") ? data : `0x${data}`,
      gas: gasLimit,
      maxFeePerGas: baseGasPrice,
      maxPriorityFeePerGas: baseGasPrice,
      value: BigInt(0),
    });

    console.log("[✅] Transaction submitted:", txResult);
    return txResult;
  } catch (error) {
    console.error("❌ ERROR:", error);
    process.exit(1);
  }
}

publishTestV2()
  .then((txHash) => {
    console.log("🔗 Transaction Hash:", txHash);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ ERROR:", err);
    process.exit(1);
  });
