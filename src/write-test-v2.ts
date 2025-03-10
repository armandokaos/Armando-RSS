// write-test-v2.ts
import "dotenv/config";
import { Ipfs, Triple, Relation } from "@graphprotocol/grc-20";
import { wallet } from "./wallet.js";
import crypto from "crypto";
import bs58 from "bs58";

/**
 * This script creates a NEW entity that is typed as "Press release" (ID: RZauYFG6886WwWHiq6y5JM).
 * It also adds:
 *   - Name = "Test press"
 *   - Publisher = Chainwire (ID: 6RrWbaDFvzrynhMyqZz4Gf) via a relation
 *   - Publish date = 2025-03-08 (ISO 8601)
 *   - Web URL = "https://chainwire.org/"
 *   - A Block entity for text = "Hello les News!" (linked with the Blocks relation)
 *
 * We do NOT create or duplicate any Properties. We only reference existing attributes (Publisher, Blocks, etc.).
 * We fix the "RELATION" type by using Relation.make(...) for Publisher and Blocks, because those are relation attributes.
 */

// GRC-20 has 6 native value types: TEXT, NUMBER, CHECKBOX, URL, TIME, POINT.
// For linking entities, we use "Relation.make(...)".

// IDs for existing attributes:
const nameAttributeId       = "LuBWqZAu6pz54eiJS5mLv8"; // Name (TEXT)
const publishDateAttributeId = "KPNjGaLx5dKofVhT6Dfw22"; // Publish date (TIME)
const webUrlAttributeId     = "93stf6cgYvBsdPruRzq1KK"; // Web URL (URL)
const descriptionAttributeId = "LA1DqP5v6QAdsgLPXGF3YA"; // Typically used for text (TEXT)

// These two are RELATION-type attributes. We handle them with Relation.make():
const publisherAttributeId = "Lc4JrkpMUPhNstqs7mvnc5"; // Publisher (Relation)
const blocksAttributeId    = "QYbjCM6NT9xmh2hFGsqpQX";  // Blocks (Relation<Block>)

// The universal "Types" relation ID
const typesRelationId = "Jfmby78N4BCseZinBmdVov";

// Press release is a Type with ID = RZauYFG6886WwWHiq6y5JM
const pressReleaseTypeId = "RZauYFG6886WwWHiq6y5JM";

// "Chainwire" ID for the Publisher relation
const chainwirePublisherId = "6RrWbaDFvzrynhMyqZz4Gf";

// We will create two new IDs:
// 1) The "Test press" entity itself
// 2) A block entity to store the text "Hello les News!"
function generateUniqueId(): string {
  const randomBytes = crypto.randomBytes(16);
  return bs58.encode(randomBytes);
}

const newPressReleaseEntityId = generateUniqueId();
const blockEntityId = generateUniqueId();

export async function writeTestV2(): Promise<string> {
  console.log("📡 [IPFS] Creating a new 'Test press' entity typed as Press release...");

  if (!process.env.RPC_URL) {
    console.error("❌ ERROR: RPC_URL is missing in .env file.");
    process.exit(1);
  }

  // 1) Make the new entity typed as "Press release"
  //    i.e. newPressReleaseEntityId --(Types)--> RZauYFG6886WwWHiq6y5JM
  const pressReleaseRelationOp = Relation.make({
    fromId: newPressReleaseEntityId,
    relationTypeId: typesRelationId, // "Types"
    toId: pressReleaseTypeId,        // "Press release"
  });

  // 2) Name = "Test press" (TEXT)
  const nameOp = Triple.make({
    entityId: newPressReleaseEntityId,
    attributeId: nameAttributeId,
    value: {
      type: "TEXT",
      value: "Test press",
    },
  });

  // 3) Publish date = "2025-03-08T00:00:00.000Z" (TIME)
  const dateOp = Triple.make({
    entityId: newPressReleaseEntityId,
    attributeId: publishDateAttributeId,
    value: {
      type: "TIME",
      value: "2025-03-08T00:00:00.000Z",
    },
  });

  // 4) Web URL = "https://chainwire.org/" (URL)
  const urlOp = Triple.make({
    entityId: newPressReleaseEntityId,
    attributeId: webUrlAttributeId,
    value: {
      type: "URL",
      value: "https://chainwire.org/",
    },
  });

  // 5) Publisher = "Chainwire" -> we must do a Relation.make, because "Publisher" is a Relation attribute
  //    i.e. newPressReleaseEntityId --(Publisher)--> chainwirePublisherId
  const publisherOp = Relation.make({
    fromId: newPressReleaseEntityId,
    relationTypeId: publisherAttributeId, // "Publisher"
    toId: chainwirePublisherId,
  });

  // 6) Create a block entity to hold "Hello les News!"
  //    We'll store that text in the block entity using the "Description" attribute
  const blockDescriptionOp = Triple.make({
    entityId: blockEntityId,
    attributeId: descriptionAttributeId,
    value: {
      type: "TEXT",
      value: "Hello les News!", // could be markdown
    },
  });

  // 7) Link the new entity to the block via "Blocks" (Relation)
  //    i.e. newPressReleaseEntityId --(Blocks)--> blockEntityId
  const blocksRelationOp = Relation.make({
    fromId: newPressReleaseEntityId,
    relationTypeId: blocksAttributeId, // "Blocks"
    toId: blockEntityId,
  });

  // Combine everything
  const ops = [
    pressReleaseRelationOp,
    nameOp,
    dateOp,
    urlOp,
    publisherOp,
    blockDescriptionOp,
    blocksRelationOp,
  ];

  console.log("🔍 DEBUG: Operations:", JSON.stringify(ops, null, 2));

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
      name: "Create new entity typed as Press Release with publisher, date, blocks",
      author: authorAddress,
      ops,
    });
  } catch (error) {
    console.error("❌ ERROR: Failed to publish to IPFS:", error);
    process.exit(1);
  }

  console.log("✅ [IPFS] Edit published, hash:", ipfsHash);
  console.log("🔗 New Press Release entity ID:", newPressReleaseEntityId);
  console.log("🔗 Block entity ID:", blockEntityId);

  return ipfsHash;
}

// Run directly with "--run"
if (process.argv.includes("--run")) {
  writeTestV2()
    .then((hash) => {
      console.log("🔗 IPFS Hash:", hash);
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ ERROR:", err);
      process.exit(1);
    });
}
