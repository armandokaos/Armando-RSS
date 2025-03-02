import axios, { AxiosError } from "axios";
import { Ipfs } from "@graphprotocol/grc-20";
import { wallet } from "./wallet.ts"; // <-- Assure-toi d'avoir un wallet configuré
                                   // (là où tu initialises le compte/clé)

const GEO_EDIT_URL = "https://testnet-api.geo.xyz/spaces/edit";

/**
 * Envoie des opérations "Triple" à Geo :
 * 1) Publie les opérations sur IPFS
 * 2) Envoie la requête POST à Geo testnet
 *
 * @param ops   Tableau d'opérations Triple (ex: [ Triple.make({ ... }) ])
 * @param name  Nom de l'édition (ex: "Add description to space")
 * @param editId Identifiant unique de l'édition (ex: "myspace-description-1")
 */
export async function writeTriples(ops: any[], name: string, editId: string): Promise<void> {
  try {
    // 1) Publier les opérations sur IPFS via grc-20
    const ipfsHash = await Ipfs.publishEdit({
      name,
      author: wallet.address,  // Ton adresse ETH signataire
      ops,                             // Les opérations Triple ou Relation
    });

    console.log("✅ IPFS publishEdit hash:", ipfsHash);

    // 2) Construire l’objet "edit" pour l’API Geo
    const edit = {
      version: "1.0.0",
      type: 1,  // 1 => ADD_EDIT
      id: editId,
      name,
      ops: ops.map((op) => ({
        type: 1,     // 1 => SET_TRIPLE (pour "Relation.make" ce serait similaire)
        triple: op,  // L'opération Triple elle-même
      })),
      authors: [wallet.address],
    };

    // 3) Envoyer la requête POST à Geo testnet
    const response = await axios.post(GEO_EDIT_URL, edit, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Geo API response:", response.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("❌ Geo API error:", error.response?.data || error.message);
    } else {
      console.error("❌ Unexpected error:", (error as Error).message);
    }
  }
}
