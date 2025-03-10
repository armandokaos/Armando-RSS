// publish-fuu.ts
import "dotenv/config";
import { createWalletClient, http, parseGwei } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { grc20Testnet } from "./testnet.js"; // Reuse your existing testnet definition

// Only English comments here:
// This script reads the "published_fuu.json" file created by write-fuu.ts,
// and for each IPFS hash, calls the GRC-20 API to fetch the "calldata" needed to
// finalize the transaction on Geo Testnet. Then it sends the transaction on-chain.
// That finalizes the edits so they become visible on the network.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLISHED_FILE = path.join(__dirname, "../data/published_fuu.json");
const spaceId = "NCdYgAuRjEYgsRrzQ5W4NC"; // Your existing Space ID

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error("❌ ERROR: PRIVATE_KEY is missing in .env file.");
  process.exit(1);
}
const account = privateKeyToAccount(`0x${privateKey}`);

const rpcUrl = process.env.RPC_URL || grc20Testnet.rpcUrls.default.http[0];
if (!rpcUrl) {
  console.error("❌ ERROR: RPC_URL is missing in .env file.");
  process.exit(1);
}

const walletClient = createWalletClient({
  account,
  chain: grc20Testnet,
  transport: http(rpcUrl),
});

async function publishFu() {
  if (!fs.existsSync(PUBLISHED_FILE)) {
    console.error(`❌ ERROR: File not found: ${PUBLISHED_FILE}`);
    process.exit(1);
  }

  let publishedList;
  try {
    const fileContent = await fs.readFile(PUBLISHED_FILE, "utf-8");
    publishedList = JSON.parse(fileContent);
  } catch (error) {
    console.error("❌ ERROR: Failed to parse published_fuu.json:", error);
    process.exit(1);
  }

  if (!Array.isArray(publishedList) || publishedList.length === 0) {
    console.log("⚠️ No items found in published_fuu.json");
    return;
  }

  console.log(`🔎 Found ${publishedList.length} IPFS entries to publish on-chain.`);

  for (let i = 0; i < publishedList.length; i++) {
    const record = publishedList[i];
    const { title, ipfsHash } = record;
    if (!ipfsHash) {
      console.warn(`⚠️ Skipping item #${i + 1} - missing ipfsHash.`);
      continue;
    }

    console.log(`\n[${i + 1}/${publishedList.length}] Publishing: "${title}"`);
    // Build the calldata request
    const apiUrl = `https://api-testnet.grc-20.thegraph.com/space/${spaceId}/edit/calldata`;
    const payload = {
      spaceId,
      cid: ipfsHash.startsWith("ipfs://") ? ipfsHash : `ipfs://${ipfsHash}`,
      network: "TESTNET",
    };

    console.log("🔍 Fetching 'to' and 'data' from GRC-20 API...");

    let to: `0x${string}`;
    let data: `0x${string}`;

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

      const responseJson = await result.json();
      to = responseJson.to;
      data = responseJson.data;
    } catch (error) {
      console.error("❌ ERROR: Failed to get calldata from API:", error);
      continue; // Skip this item
    }

    console.log("[DEBUG] 'to' returned by API:", to);
    console.log("[DEBUG] 'data' returned by API:", data);

    console.log("⛽ Preparing transaction...");
    // We keep a generous gas limit, e.g. 13,000,000
    const gasLimit = BigInt(13000000);
    const baseGasPrice = parseGwei("0.01"); // Adjust if needed

    try {
      const txHash = await walletClient.sendTransaction({
        chain: grc20Testnet,
        to: `0x${to.replace(/^0x/, '')}`,
        data: data.startsWith("0x") ? (data as `0x${string}`) : `0x${data}`,
        gas: gasLimit,
        maxFeePerGas: baseGasPrice,
        maxPriorityFeePerGas: baseGasPrice,
        value: BigInt(0),
      });

      console.log(`[✅] Transaction submitted for "${title}": ${String(txHash)}`);
    } catch (err) {
      console.error("❌ ERROR: Transaction failed:", err);
    }
  }

  console.log("\n✅ Done publishing all items!");
}

// Optional direct run
if (process.argv.includes("--run")) {
  publishFu()
    .then(() => {
      console.log("✅ Done.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ ERROR:", err);
      process.exit(1);
    });
}

export { publishFu };
