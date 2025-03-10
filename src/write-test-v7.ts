// write-test-v7.ts
import "dotenv/config";
import { Ipfs, Op, SetTripleOp, CreateRelationOp, ValueType } from "@graphprotocol/grc-20";
import { wallet } from "./wallet.js";
import crypto from "crypto";
import bs58 from "bs58";

/**
 * Minimal type definitions for ops:
 * We allow either a CREATE_RELATION or a SET_TRIPLE
 */

// Removed custom type definitions as they are imported from @graphprotocol/grc-20

/**
 * We'll define two helper functions:
 *   - generateUniqueId() to create Base58 IDs
 *   - makeRelation() to produce a "CREATE_RELATION" op
 *   - makeTriple() to produce a "SET_TRIPLE" op
 */

function generateUniqueId(): string {
  const rnd = crypto.randomBytes(16);
  return bs58.encode(rnd);
}

// Syntactic sugar for "CREATE_RELATION"
function makeRelation(params: {
  fromId: string;
  relationTypeId: string;
  toId: string;
  index?: string;
}): CreateRelationOp {
  return {
    type: "CREATE_RELATION",
    relation: {
      id: generateUniqueId(),    // every relation must have a unique ID
      type: params.relationTypeId,
      fromEntity: params.fromId,
      toEntity: params.toId,
      index: params.index || "",
    },
  };
}

// Syntactic sugar for "SET_TRIPLE"
function makeTriple(params: {
  entityId: string;
  attributeId: string;
  valueType: ValueType;
  valueStr: string;
}): SetTripleOp {
  return {
    type: "SET_TRIPLE",
    triple: {
      attribute: params.attributeId,
      entity: params.entityId,
      value: {
        type: params.valueType,
        value: params.valueStr,
      },
    },
  };
}

/**
 * IDs for Press Release
 */

// Press Release as a Type
const pressReleaseTypeId = "RZauYFG6886WwWHiq6y5JM";
const typesRelationId    = "Jfmby78N4BCseZinBmdVov"; // "Types"

// Basic attributes for the Press Release entity
const nameAttributeId        = "LuBWqZAu6pz54eiJS5mLv8";  
const publishDateAttributeId = "KPNjGaLx5dKofVhT6Dfw22";   
const webUrlAttributeId      = "93stf6cgYvBsdPruRzq1KK";  
const publisherRelationId    = "Lc4JrkpMUPhNstqs7mvnc5";  
const chainwirePublisherId   = "6RrWbaDFvzrynhMyqZz4Gf";  

/**
 * Minimal local "SystemIds" for a Data Block approach
 */
const blocksRelationId             = "QYbjCM6NT9xmh2hFGsqpQX";     // "Blocks"
const dataBlockTypeId              = "xxxxxDATA_BLOCK";           // real ID for "Data block"
const dataSourceTypeRelationTypeId = "xxxxDATA_SOURCE_TYPE";      // relation ID for "Data source type"
const collectionDataSourceId       = "yyyyCOLLECTION_SOURCE";     // your ID for "COLLECTION_DATA_SOURCE"
const namePropertyId               = "LuBWqZAu6pz54eiJS5mLv8";     // often the same as Name
// adapt or reuse the same for "NAME_PROPERTY" if you want a different attribute

/**
 * We'll define a function makeDataBlock(...) that returns Op[]
 */

function makeDataBlock({
  fromId,
  sourceType = "COLLECTION",
  position = "1",
  name,
}: {
  fromId: string;
  sourceType?: string;
  position?: string;
  name?: string;
}): Op[] {
  const blockId = generateUniqueId();

  // 1) Mark the block as "Data block"
  const relBlockType = makeRelation({
    fromId: blockId,
    relationTypeId: typesRelationId, // "Types"
    toId: dataBlockTypeId,
  });

  // 2) Mark the block's source type
  const relSourceType = makeRelation({
    fromId: blockId,
    relationTypeId: dataSourceTypeRelationTypeId,
    toId: collectionDataSourceId, // e.g. "COLLECTION_DATA_SOURCE"
  });

  // 3) Link the block to the main entity
  const relBlocks = makeRelation({
    fromId,
    relationTypeId: blocksRelationId,
    toId: blockId,
    index: position,
  });

  const ops: Op[] = [relBlockType, relSourceType, relBlocks];

  // If we want to store text in the Name of the block:
  if (name) {
    const setNameOp = makeTriple({
      entityId: blockId,
      attributeId: namePropertyId,
      valueType: "TEXT",
      valueStr: name,
    });
    ops.push(setNameOp);
  }

  return ops;
}

// This is the text that we want to appear in the data block
const marketingText = `
The 2025 Excellence in Marketing Leadership and Innovation Award will be presented...
(etc)
`.trim();

const newPressReleaseEntityId = generateUniqueId();

export async function writeTestV7(): Promise<string> {
  console.log("📡 Creating a new Press Release v7 + Data Block...");

  if (!process.env.RPC_URL) {
    console.error("❌ ERROR: RPC_URL is missing in .env.");
    process.exit(1);
  }

  // 1) Press release is typed as "Press release"
  const opPressReleaseType = makeRelation({
    fromId: newPressReleaseEntityId,
    relationTypeId: typesRelationId,
    toId: pressReleaseTypeId,
  });

  // 2) Name = "Test press v7"
  const opName = makeTriple({
    entityId: newPressReleaseEntityId,
    attributeId: nameAttributeId,
    valueType: "TEXT",
    valueStr: "Test press v7",
  });

  // 3) Publish date
  const opDate = makeTriple({
    entityId: newPressReleaseEntityId,
    attributeId: publishDateAttributeId,
    valueType: "TIME",
    valueStr: "2025-03-08T00:00:00.000Z",
  });

  // 4) Web URL
  const opUrl = makeTriple({
    entityId: newPressReleaseEntityId,
    attributeId: webUrlAttributeId,
    valueType: "URL",
    valueStr: "https://chainwire.org/",
  });

  // 5) Publisher => chainwire
  const opPublisher = makeRelation({
    fromId: newPressReleaseEntityId,
    relationTypeId: publisherRelationId,
    toId: chainwirePublisherId,
  });

  // 6) Data block to store the marketingText in the block's name
  const dataBlockOps = makeDataBlock({
    fromId: newPressReleaseEntityId,
    sourceType: "COLLECTION",
    position: "1",
    name: marketingText,
  });

  // Combine all ops
  const ops: Op[] = [
    opPressReleaseType,
    opName,
    opDate,
    opUrl,
    opPublisher,
    ...dataBlockOps,
  ];

  console.log("🔍 DEBUG ops:", JSON.stringify(ops, null, 2));

  // Retrieve wallet address
  const authorAddress = await wallet.getAddress();
  if (!authorAddress) {
    console.error("❌ ERROR: no wallet address found.");
    process.exit(1);
  }
  console.log(`✅ DEBUG: wallet = ${authorAddress}`);

  let ipfsHash;
  try {
    console.log("📡 Publishing to IPFS...");
    ipfsHash = await Ipfs.publishEdit({
      name: "Press Release v7 with Data Block (correct union type)",
      author: authorAddress,
      ops,
    });
  } catch (error) {
    console.error("❌ ERROR: IPFS publish failed:", error);
    process.exit(1);
  }

  console.log("✅ IPFS edit published, hash:", ipfsHash);
  console.log("🔗 Press Release ID:", newPressReleaseEntityId);
  return ipfsHash;
}

// If run directly
if (process.argv.includes("--run")) {
  writeTestV7()
    .then((hash) => {
      console.log("🔗 IPFS Hash:", hash);
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ ERROR:", err);
      process.exit(1);
    });
}
