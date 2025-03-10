import "dotenv/config"; // ✅ Charge .env
import { Ipfs, Triple } from "@graphprotocol/grc-20";
import { wallet } from "./wallet.js";
import crypto from "crypto";
import bs58 from "bs58";

const spaceId = "NCdYgAuRjEYgsRrzQ5W4NC"; // 🔥 ID du Space
const nameAttributeId = "LuBWqZAu6pz54eiJS5mLv8"; // ✅ ID de la propriété Name

// ✅ Vérification que RPC_URL est bien chargé
if (!process.env.RPC_URL) {
  console.error("❌ ERROR: No RPC URL configured. Set RPC_URL in src/.env file.");
  process.exit(1);
}

/**
 * Génère un identifiant unique au format Base58.
 * On utilise 16 octets aléatoires pour obtenir une chaîne suffisamment unique.
 */
function generateBase58UniqueId(): string {
  const randomBytes = crypto.randomBytes(16);
  return bs58.encode(randomBytes);
}

export async function createChainwireEntity(): Promise<string> {
  console.log("📡 [IPFS] Création d'une nouvelle entité Chainwire avec un ID Base58 unique...");
  
  // ✅ Génération d'un ID unique respectant la norme Geo Testnet
  const entityId = generateBase58UniqueId();
  console.log(`🔑 ID généré : ${entityId}`);

  // 🆕 Création de l'entité "Chainwire" (SANS RELATION)
  const ops = [
    Triple.make({
      entityId: entityId, // ✅ ID unique au format Base58
      attributeId: nameAttributeId, // ✅ Nom de l'entité
      value: { 
        type: "TEXT", 
        value: "Chainwire", // 🔥 Le bon nom
      },
    }),
  ];

  const authorAddress = await wallet.getAddress();
  const ipfsHash = await Ipfs.publishEdit({
    name: "Create Chainwire Entity", // ✅ Le bon titre
    author: authorAddress,
    ops,
  });

  console.log("✅ [IPFS] Publication réussie, hash :", ipfsHash);
  return ipfsHash;
}

// 🔥 Exécution directe
if (process.argv.includes("--run")) {
  createChainwireEntity()
    .then((hash) => {
      console.log("🔗 IPFS Hash:", hash);
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Error:", err);
      process.exit(1);
    });
}
