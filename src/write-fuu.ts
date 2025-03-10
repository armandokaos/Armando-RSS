// write-fuu.ts
import "dotenv/config";
import { Ipfs, Triple, Relation } from "@graphprotocol/grc-20";
import { wallet } from "./wallet.js"; // Reuse your existing wallet import
import crypto from "crypto";
import bs58 from "bs58";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Only English comments here:
// This script reads the JSON data from the Chainwire RSS feed (stored by scraper-v2.ts),
// then creates a new "Press Release" entity for each item, publishing an IPFS edit.
// It writes the result (IPFS hash, entity IDs, etc.) into a new file named "published_fuu.json".

// Convert import.meta.url to file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Input file where the press releases have been saved by the scraper
const DATA_FILE = path.join(__dirname, "../data/press_releases.json");

// Output file where we will store the IPFS hashes and entity IDs
const PUBLISHED_FILE = path.join(__dirname, "../data/published_fuu.json");

// Attribute IDs, from your existing code:
const nameAttributeId       = "LuBWqZAu6pz54eiJS5mLv8";  // Name (TEXT)
const publishDateAttributeId = "KPNjGaLx5dKofVhT6Dfw22"; // Publish date (TIME)
const webUrlAttributeId     = "93stf6cgYvBsdPruRzq1KK";  // Web URL (URL)
const descriptionAttributeId = "LA1DqP5v6QAdsgLPXGF3YA"; // Description (TEXT)

// These two are RELATION-type attributes:
const publisherAttributeId = "Lc4JrkpMUPhNstqs7mvnc5"; // Publisher (Relation)
const blocksAttributeId    = "QYbjCM6NT9xmh2hFGsqpQX"; // Blocks (Relation<Block>)

// The universal "Types" relation ID
const typesRelationId = "Jfmby78N4BCseZinBmdVov";

// Press release type ID
const pressReleaseTypeId = "RZauYFG6886WwWHiq6y5JM";

// Chainwire publisher ID
const chainwirePublisherId = "6RrWbaDFvzrynhMyqZz4Gf";

// Helper to generate a new Base58-encoded ID
function generateUniqueId(): string {
  const randomBytes = crypto.randomBytes(16);
  return bs58.encode(randomBytes);
}

async function writeFu() {
  // Read existing articles from JSON
  if (!fs.existsSync(DATA_FILE)) {
    console.error(`❌ ERROR: Data file not found: ${DATA_FILE}`);
    process.exit(1);
  }

  let articles;
  try {
    const fileContent = await fs.readFile(DATA_FILE, "utf-8");
    articles = JSON.parse(fileContent);
  } catch (error) {
    console.error("❌ ERROR: Failed to read or parse press_releases.json:", error);
    process.exit(1);
  }

  if (!Array.isArray(articles) || articles.length === 0) {
    console.log("⚠️ No articles found in the JSON file.");
    return;
  }

  // Retrieve author address from wallet
  const authorAddress = await wallet.getAddress();
  if (!authorAddress) {
    console.error("❌ ERROR: Wallet address is missing.");
    process.exit(1);
  }

  console.log(`✅ Wallet address: ${authorAddress}`);
  console.log(`🔎 Found ${articles.length} articles. Processing...`);

  // Prepare an array to keep track of published items
  const publishedResults: Array<{
    title: string;
    entityId: string;
    blockId: string;
    ipfsHash: string;
  }> = [];

  // Iterate over each article and create a new Press Release
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];

    // Basic fields from the RSS feed
    const title = article.title || "Untitled";
    const link = article.link || "https://chainwire.org/";
    let pubDate = article.pubDate;
    // If there's no valid date, default to now
    if (!pubDate || isNaN(Date.parse(pubDate))) {
      pubDate = new Date().toISOString();
    }

    // The press release entity
    const newPressReleaseEntityId = generateUniqueId();

    // The block entity for the content
    const blockEntityId = generateUniqueId();

    // 1) Link the new entity to the Press Release type
    const pressReleaseRelationOp = Relation.make({
      fromId: newPressReleaseEntityId,
      relationTypeId: typesRelationId,
      toId: pressReleaseTypeId,
    });

    // 2) Name = article title
    const nameOp = Triple.make({
      entityId: newPressReleaseEntityId,
      attributeId: nameAttributeId,
      value: {
        type: "TEXT",
        value: title,
      },
    });

    // 3) Publish date
    const dateOp = Triple.make({
      entityId: newPressReleaseEntityId,
      attributeId: publishDateAttributeId,
      value: {
        type: "TIME",
        value: new Date(pubDate).toISOString(),
      },
    });

    // 4) Web URL
    const urlOp = Triple.make({
      entityId: newPressReleaseEntityId,
      attributeId: webUrlAttributeId,
      value: {
        type: "URL",
        value: link,
      },
    });

    // 5) Publisher = Chainwire
    const publisherOp = Relation.make({
      fromId: newPressReleaseEntityId,
      relationTypeId: publisherAttributeId,
      toId: chainwirePublisherId,
    });

    // 6) Create a block for the content
    const blockDescriptionOp = Triple.make({
      entityId: blockEntityId,
      attributeId: descriptionAttributeId,
      value: {
        type: "TEXT",
        value: article.content || "No content available",
      },
    });

    // 7) Link the main entity to the block
    const blocksRelationOp = Relation.make({
      fromId: newPressReleaseEntityId,
      relationTypeId: blocksAttributeId,
      toId: blockEntityId,
    });

    // Combine all operations
    const ops = [
      pressReleaseRelationOp,
      nameOp,
      dateOp,
      urlOp,
      publisherOp,
      blockDescriptionOp,
      blocksRelationOp,
    ];

    console.log(`\n[${i + 1}/${articles.length}] Creating Press Release: "${title}"`);
    console.log("Preparing IPFS publish...");

    // Publish to IPFS
    let ipfsHash;
    try {
      ipfsHash = await Ipfs.publishEdit({
        name: `Press Release: ${title}`,
        author: authorAddress,
        ops,
      });
    } catch (error) {
      console.error("❌ ERROR: Failed to publish to IPFS:", error);
      continue; // Skip this item but continue with others
    }

    console.log("✅ IPFS edit published. Hash =", ipfsHash);
    console.log("   Entity ID =", newPressReleaseEntityId);
    console.log("   Block ID  =", blockEntityId);

    // Save the info so we can publish on-chain later
    publishedResults.push({
      title,
      entityId: newPressReleaseEntityId,
      blockId: blockEntityId,
      ipfsHash,
    });
  }

  // Save results to disk
  if (publishedResults.length > 0) {
    try {
      await fs.ensureDir(path.dirname(PUBLISHED_FILE));
      await fs.writeFile(
        PUBLISHED_FILE,
        JSON.stringify(publishedResults, null, 2),
        "utf8"
      );
      console.log(`\n📁 Saved published records to: ${PUBLISHED_FILE}`);
    } catch (error) {
      console.error("❌ ERROR: Failed to write published_fus.json:", error);
    }
  } else {
    console.log("\nNo items were published to IPFS.");
  }
}

// Optional direct run
if (process.argv.includes("--run")) {
  writeFu()
    .then(() => {
      console.log("✅ Done.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ ERROR:", err);
      process.exit(1);
    });
}

export { writeFu };
