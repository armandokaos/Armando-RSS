// write-pro-v2.ts
import "dotenv/config";
import { Ipfs, Relation } from "@graphprotocol/grc-20";
import { wallet } from "./wallet.js";

// We are working with Press Release ID: RZauYFG6886WwWHiq6y5JM
const pressReleaseId = "RZauYFG6886WwWHiq6y5JM";

// Space ID
const spaceId = "NCdYgAuRjEYgsRrzQ5W4NC";

// Relation "Properties" ID
const propertiesRelationId = "9zBADaYzyfzyFJn4GU1cC";

// Property IDs to link as "Properties"
const webUrlId = "93stf6cgYvBsdPruRzq1KK";   // Web URL
const publisherId = "Lc4JrkpMUPhNstqs7mvnc5"; // Publisher
const publishDateId = "KPNjGaLx5dKofVhT6Dfw22"; // Publish date
const blocksId = "QYbjCM6NT9xmh2hFGsqpQX";    // Blocks

// This helper checks if a relation already exists to avoid duplicates.
async function relationExists(fromId: string, relationTypeId: string, toId: string): Promise<boolean> {
  const checkUrl = `https://api-testnet.grc-20.thegraph.com/space/${spaceId}/relations?fromId=${fromId}&toId=${toId}&relationTypeId=${relationTypeId}`;
  try {
    const response = await fetch(checkUrl);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return true;
      }
    } else if (response.status !== 404) {
      console.warn(`⚠️ Warning: Relation check [${fromId} --(${relationTypeId})--> ${toId}] failed. Status = ${response.status}`);
    }
  } catch (error) {
    console.warn("⚠️ Warning: Error while checking relation:", error);
  }
  return false;
}

export async function writeProV2(): Promise<string> {
  console.log("📡 [IPFS] Adding properties (Web URL, Publisher, Publish date, Blocks) to Press release...");

  if (!process.env.RPC_URL) {
    console.error("❌ ERROR: RPC_URL is missing in .env file.");
    process.exit(1);
  }

  const neededOps: any[] = [];

  // Check 1) Press release --(Properties)--> Web URL
  if (!(await relationExists(pressReleaseId, propertiesRelationId, webUrlId))) {
    neededOps.push(
      Relation.make({
        fromId: pressReleaseId,
        relationTypeId: propertiesRelationId,
        toId: webUrlId,
      })
    );
  }

  // Check 2) Press release --(Properties)--> Publisher
  if (!(await relationExists(pressReleaseId, propertiesRelationId, publisherId))) {
    neededOps.push(
      Relation.make({
        fromId: pressReleaseId,
        relationTypeId: propertiesRelationId,
        toId: publisherId,
      })
    );
  }

  // Check 3) Press release --(Properties)--> Publish date
  if (!(await relationExists(pressReleaseId, propertiesRelationId, publishDateId))) {
    neededOps.push(
      Relation.make({
        fromId: pressReleaseId,
        relationTypeId: propertiesRelationId,
        toId: publishDateId,
      })
    );
  }

  // Check 4) Press release --(Properties)--> Blocks
  if (!(await relationExists(pressReleaseId, propertiesRelationId, blocksId))) {
    neededOps.push(
      Relation.make({
        fromId: pressReleaseId,
        relationTypeId: propertiesRelationId,
        toId: blocksId,
      })
    );
  }

  // If no relations are needed, we exit
  if (neededOps.length === 0) {
    console.log("✅ All properties are already linked. No new edit will be created.");
    process.exit(0);
  }

  console.log("🔍 DEBUG: Generated operations:", JSON.stringify(neededOps, null, 2));

  const authorAddress = await wallet.getAddress();
  if (!authorAddress) {
    console.error("❌ ERROR: Wallet address is missing.");
    process.exit(1);
  }
  console.log(`✅ DEBUG: Wallet address = ${authorAddress}`);

  let ipfsHash;
  try {
    console.log("📡 Publishing edit to IPFS...");
    ipfsHash = await Ipfs.publishEdit({
      name: "Add Web URL, Publisher, Publish date, Blocks properties to Press release (v2)",
      author: authorAddress,
      ops: neededOps,
    });
  } catch (error) {
    console.error("❌ ERROR: Failed to publish edit to IPFS:", error);
    process.exit(1);
  }

  console.log("✅ [IPFS] Edit published, hash:", ipfsHash);
  return ipfsHash;
}

// Direct execution
if (process.argv.includes("--run")) {
  writeProV2()
    .then((hash) => {
      console.log("🔗 IPFS Hash:", hash);
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ ERROR:", err);
      process.exit(1);
    });
}
