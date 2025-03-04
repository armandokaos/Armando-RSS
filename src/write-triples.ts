import { Ipfs, Triple } from "@graphprotocol/grc-20";
import { wallet } from "./wallet.js";

const spaceId = "VoNCdYgAuRjEYgsRrzQ5W4NC"; // 🔥 ID FIXE DE TON SPACE

export async function writeTriples(
  title: string,
  publishDate: string,
  webUrl: string,
  blocks: string
): Promise<string> {
  console.log("📡 [IPFS] Preparing triples for publishing...");

  const ops = [
    Triple.make({
      entityId: spaceId,
      attributeId: "LuBWqZAu6pz54eiJS5mLv8",
      value: { type: "TEXT", value: title },
    }),
    Triple.make({
      entityId: spaceId,
      attributeId: "KPNjGaLx5dKofVhT6Dfw22",
      value: { type: "TIME", value: publishDate },
    }),
    Triple.make({
      entityId: spaceId,
      attributeId: "93stf6cgYvBsdPruRzq1KK",
      value: { type: "URL", value: webUrl },
    }),
    Triple.make({
      entityId: spaceId,
      attributeId: "QYbjCM6NT9xmh2hFGsqpQX",
      value: { type: "TEXT", value: blocks },
    }),
  ];

  const authorAddress = await wallet.getAddress();
  const ipfsHash = await Ipfs.publishEdit({
    name: title,
    author: authorAddress,
    ops,
  });

  console.log("✅ [IPFS] Published edit:", ipfsHash);
  return ipfsHash;
}

// 🔥 EXÉCUTION DIRECTE SI UTILISÉ AVEC `bun run write-triples.ts`
if (process.argv.includes("--run")) {
  const title = "Example Press Release";
  const publishDate = "2025-03-01T12:00:00Z";
  const webUrl = "https://example.com/press-release";
  const blocks = "This is the content of the press release...";

  writeTriples(title, publishDate, webUrl, blocks)
    .then((hash) => {
      console.log("🔗 IPFS Hash:", hash);
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Error:", err);
      process.exit(1);
    });
}
