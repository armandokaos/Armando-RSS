import { createWalletClient, http, parseGwei } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import "dotenv/config";
import { grc20Testnet } from "./testnet.js";

const spaceId = "NCdYgAuRjEYgsRrzQ5W4NC";
const ipfsHash = process.argv[2];

if (!ipfsHash) {
  console.error("❌ ERROR: Vous devez fournir un IPFS Hash.");
  process.exit(1);
}

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error("❌ ERROR: PRIVATE_KEY is missing in the .env file.");
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

async function publishProperties() {
  console.log(`[1️⃣] Récupération du calldata depuis l'API pour l'édition dans le Space ${spaceId}...`);

  const apiUrl = `https://api-testnet.grc-20.thegraph.com/space/${spaceId}/edit/calldata`;
  const payload = {
    spaceId: spaceId,
    cid: ipfsHash.startsWith("ipfs://") ? ipfsHash : `ipfs://${ipfsHash}`,
    network: "TESTNET",
  };

  console.log("🔍 DEBUG: Payload de la requête API :", JSON.stringify(payload, null, 2));
  console.log("🔍 DEBUG: URL de l'API :", apiUrl);

  try {
    const result = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!result.ok) {
      const errorText = await result.text();
      console.error("❌ ERROR: La requête API a échoué.");
      console.error("[DEBUG] Statut :", result.status);
      console.error("[DEBUG] Corps :", errorText);
      throw new Error(`API Error: ${errorText}`);
    }

    const { to, data } = await result.json();
    console.log("[DEBUG] Adresse 'to' renvoyée par l'API :", to);
    console.log("[DEBUG] Payload 'data' renvoyée par l'API :", data);

    console.log("[2️⃣] Envoi de la transaction vers la blockchain...");

    const gasLimit = BigInt(13000000);
    const baseGasPrice = parseGwei("0.01");

    const txResult = await walletClient.sendTransaction({
      chain: grc20Testnet,
      to: to,
      data: data.startsWith("0x") ? data : `0x${data}`,
      gas: gasLimit,
      maxFeePerGas: baseGasPrice,
      maxPriorityFeePerGas: baseGasPrice,
      value: BigInt(0),
    });

    console.log("[✅] Transaction soumise :", txResult);
    return txResult;
  } catch (error) {
    console.error("❌ ERROR :", error);
    process.exit(1);
  }
}

publishProperties()
  .then((txHash) => {
    console.log("🔗 Transaction Hash :", txHash);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ ERROR :", err);
    process.exit(1);
  });
