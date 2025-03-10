// write-press-release-v2.ts
import "dotenv/config";
import { Ipfs, Triple, Relation } from "@graphprotocol/grc-20";
import { wallet } from "./wallet.js";
import crypto from "crypto";
import bs58 from "bs58";

// ID references for Name, Description, and Type.
const nameAttributeId = "LuBWqZAu6pz54eiJS5mLv8";
const descriptionAttributeId = "LA1DqP5v6QAdsgLPXGF3YA";
const relationTypeId = "Jfmby78N4BCseZinBmdVov";
const typeEntityId = "VdTsW1mGiy1XSooJaBBLc4";

// This function generates a unique Base58 identifier.
function generateUniqueId(): string {
  const randomBytes = crypto.randomBytes(16);
  return bs58.encode(randomBytes);
}

// Create a unique ID for the new Press Release entity
const pressReleaseId = generateUniqueId();

export async function writePressReleaseV2(): Promise<string> {
  console.log("📡 [IPFS] Creating Press release entity with Name, Description and 'Types' relation...");

  if (!process.env.RPC_URL) {
    console.error("❌ ERROR: RPC_URL is missing in .env file.");
    process.exit(1);
  }

  // Triple operation for the Name
  const nameOp = Triple.make({
    entityId: pressReleaseId,
    attributeId: nameAttributeId,
    value: {
      type: "TEXT",
      value: "Press release",
    },
  });

  // Triple operation for the Description
  const descriptionOp = Triple.make({
    entityId: pressReleaseId,
    attributeId: descriptionAttributeId,
    value: {
      type: "TEXT",
      value: "Official statement issued to announce news, events, or updates. Distributed through wire services or news agencies.",
    },
  });

  // Relation operation to link this entity to the 'Type' entity
  const typesRelationOp = Relation.make({
    fromId: pressReleaseId,
    relationTypeId: relationTypeId,
    toId: typeEntityId,
  });

  // Combine all operations in a single edit
  const ops = [nameOp, descriptionOp, typesRelationOp];

  console.log("🔍 DEBUG: Generated operations:", JSON.stringify(ops, null, 2));

  // Retrieve the wallet address
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
      name: "Create Press Release with Name, Description and Type",
      author: authorAddress,
      ops,
    });
  } catch (error) {
    console.error("❌ ERROR: IPFS publish failed:", error);
    process.exit(1);
  }

  console.log("✅ [IPFS] Edit published, hash:", ipfsHash);
  console.log("🔗 New Press Release Entity ID:", pressReleaseId);
  return ipfsHash;
}

// Direct execution if used with "--run"
if (process.argv.includes("--run")) {
  writePressReleaseV2()
    .then((hash) => {
      console.log("🔗 IPFS Hash:", hash);
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ ERROR:", err);
      process.exit(1);
    });
}
