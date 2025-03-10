import "dotenv/config";
import { Ipfs, Relation } from "@graphprotocol/grc-20";
import { wallet } from "./wallet.js";

/**
 * IDs en présence :
 * - Press release (ID: NTEp3EBaHRw1eCDiVSgN9c)
 * - Properties (ID: 9zBADaYzyfzyFJn4GU1cC)
 * - Property (ID: GscJ2GELQjmLoaVrYyR3xm)
 * - Type (ID: Jfmby78N4BCseZinBmdVov)
 *
 * Relations à créer :
 * A) Press release --(Properties=9zBADaYzyfzyFJn4GU1cC)--> Properties=9zBADaYzyfzyFJn4GU1cC
 * B) Properties=9zBADaYzyfzyFJn4GU1cC --(Types=Jfmby78N4BCseZinBmdVov)--> Property=GscJ2GELQjmLoaVrYyR3xm
 * C) Properties=9zBADaYzyfzyFJn4GU1cC --(Types=Jfmby78N4BCseZinBmdVov)--> Type=Jfmby78N4BCseZinBmdVov
 */

const spaceId = "NCdYgAuRjEYgsRrzQ5W4NC";

// Entités
const pressReleaseId = "NTEp3EBaHRw1eCDiVSgN9c";
const propertiesEntityId = "9zBADaYzyfzyFJn4GU1cC";
const propertyEntityId = "GscJ2GELQjmLoaVrYyR3xm";
const typeEntityId = "Jfmby78N4BCseZinBmdVov";

// Relation IDs
const propertiesRelationId = "9zBADaYzyfzyFJn4GU1cC"; // "Properties"
const typesRelationId = "Jfmby78N4BCseZinBmdVov";   // "Types"

// ---- Fonctions de vérification de relation ----

async function relationExists(fromId: string, relationTypeId: string, toId: string): Promise<boolean> {
  // Endpoint : /space/{spaceId}/relations?fromId=...&toId=...&relationTypeId=...
  const url = `https://api-testnet.grc-20.thegraph.com/space/${spaceId}/relations?fromId=${fromId}&toId=${toId}&relationTypeId=${relationTypeId}`;
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return true;
      }
    } else if (response.status !== 404) {
      console.warn(`⚠️ Warning: Vérification relation [${fromId} --(${relationTypeId})--> ${toId}] a échoué. Statut = ${response.status}`);
    }
  } catch (error) {
    console.warn("⚠️ Warning: Erreur lors de la vérification de la relation :", error);
  }
  return false;
}

export async function writePropertiesProperties(): Promise<string> {
  console.log("📡 [IPFS] Création d'un edit pour 3 relations (Properties, Types)...");
  if (!process.env.RPC_URL) {
    console.error("❌ ERROR: RPC_URL is missing in .env file.");
    process.exit(1);
  }

  // 1) Press release --(Properties)--> Properties
  const needA = !(await relationExists(pressReleaseId, propertiesRelationId, propertiesEntityId));
  // 2) Properties --(Types)--> Property
  const needB = !(await relationExists(propertiesEntityId, typesRelationId, propertyEntityId));
  // 3) Properties --(Types)--> Type
  const needC = !(await relationExists(propertiesEntityId, typesRelationId, typeEntityId));

  // Si aucune relation n'est à créer, on s'arrête
  if (!needA && !needB && !needC) {
    console.log("✅ Toutes les relations existent déjà. Aucun nouvel edit ne sera créé.");
    process.exit(0);
  }

  // Construire les opérations pour les relations manquantes
  const ops = [];

  if (needA) {
    ops.push(
      Relation.make({
        fromId: pressReleaseId,
        relationTypeId: propertiesRelationId, // "Properties"
        toId: propertiesEntityId,
      })
    );
  }

  if (needB) {
    ops.push(
      Relation.make({
        fromId: propertiesEntityId,
        relationTypeId: typesRelationId, // "Types"
        toId: propertyEntityId,
      })
    );
  }

  if (needC) {
    ops.push(
      Relation.make({
        fromId: propertiesEntityId,
        relationTypeId: typesRelationId, // "Types"
        toId: typeEntityId,
      })
    );
  }

  console.log("🔍 DEBUG: Opérations générées :", JSON.stringify(ops, null, 2));

  // Récupération de l'adresse du wallet
  const authorAddress = await wallet.getAddress();
  if (!authorAddress) {
    console.error("❌ ERROR: Wallet address is missing.");
    process.exit(1);
  }
  console.log(`✅ DEBUG: Wallet address = ${authorAddress}`);

  // Publication sur IPFS
  let ipfsHash;
  try {
    console.log("📡 Publication sur IPFS...");
    ipfsHash = await Ipfs.publishEdit({
      name: "Add 'Properties' to Press release & typed as 'Property' & 'Type'",
      author: authorAddress,
      ops,
    });
  } catch (error) {
    console.error("❌ ERROR: Échec de la publication sur IPFS:", error);
    process.exit(1);
  }

  console.log("✅ [IPFS] Edit publié, hash :", ipfsHash);
  return ipfsHash;
}

// Exécution directe
if (process.argv.includes("--run")) {
  writePropertiesProperties()
    .then((hash) => {
      console.log("🔗 IPFS Hash:", hash);
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ ERROR:", err);
      process.exit(1);
    });
}
