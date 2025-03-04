import { Ipfs, Relation } from "@graphprotocol/grc-20";
import { wallet } from "./wallet.js"; // Assure-toi d'avoir un fichier wallet.ts

const GEO_RELATION_URL = "https://testnet-api.geo.xyz/spaces/edit";

/**
 * Crée une relation entre deux entités sur Geo testnet.
 *
 * @param fromId        L'entité source (ex: un utilisateur)
 * @param toId          L'entité cible (ex: un rôle, un space)
 * @param relationType  L'ID de la relation (ex: "Roles")
 * @param editName      Nom de l'édition (ex: "Assign Role")
 * @param editId        Identifiant unique de l'édition (ex: "user-role-001")
 */
export async function writeRelation(fromId: string, toId: string, relationType: string, editName: string, editId: string) {
  try {
    // 1️⃣ Construire l'opération Relation
    const relationOp = Relation.make({
      fromId,
      toId,
      relationTypeId: relationType,
    });

    // 2️⃣ Publier sur IPFS
    const ipfsHash = await Ipfs.publishEdit({
      name: editName,
      author: wallet.address,
      ops: [relationOp],
    });

    console.log("✅ IPFS publishEdit hash:", ipfsHash);

    // 3️⃣ Construire l'objet "edit" pour Geo testnet
    const edit = {
      version: "1.0.0",
      type: 1,  // 1 => ADD_EDIT
      id: editId,
      name: editName,
      ops: [{ type: 2, relation: relationOp }], // Type 2 = Relation
      authors: [wallet.address],
    };

    // 4️⃣ Envoyer la requête POST à Geo
    const response = await fetch(GEO_RELATION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edit),
    });

    const result = await response.json();
    console.log("✅ Relation ajoutée avec succès :", result);
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout de la relation :", error);
  }
}
