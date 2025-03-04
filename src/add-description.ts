import axios, { AxiosError } from "axios";
// On importe IPFS et Triple depuis @graphprotocol/grc-20
import { Ipfs, Triple } from "@graphprotocol/grc-20";

// L’URL de votre endpoint Geo (à adapter si besoin)
const GEO_API_URL = "https://testnet-api.geo.xyz/spaces";

// Interfaces pour correspondre à la structure "edit" acceptée par Geo
interface ITripleValue {
  type: number;   // 1 => TEXT
  value: string;
}

interface ITripleGeo {
  entity: string;
  attribute: string;
  value: ITripleValue;
}

interface IOp {
  type: number;  // 1 => SET_TRIPLE
  triple: ITripleGeo;
}

interface IEdit {
  version: string; 
  type: number;    
  id: string;      
  name: string;    
  ops: IOp[];      
  authors: string[];
}

async function updateSpace(): Promise<void> {
  try {
    // 1) Construire l’op (triple) avec @graphprotocol/grc-20
    const tripleOp = Triple.make({
      attributeId: "LA1DqP5v6QAdsgLPXGF3YA", // ID de la Description
      entityId: "NCdYgAuRjEYgsRrzQ5W4NC",    // ID du Space
      value: {
        type: "TEXT",    // Type GRC-20, ici du texte
        value: "The goal of this space is to publish RSS feeds.", 
      },
    });

    // 2) Publier l’édition sur IPFS
    //    On donne un nom, un auteur (en dur), et nos opérations
    const hash = await Ipfs.publishEdit({
      name: "Ajout de la Description",
      author: "0xdbAcd0A6Fb4a2f8F423D3f68519d7DBBb71BfBae", // Remplacez par votre adresse
      ops: [tripleOp],
    });
    console.log("hash IPFS retourné :", hash);

    // 3) Construire l’objet "edit" attendu par l’API Geo
    const edit: IEdit = {
      version: "1.0.0",
      type: 1,                 // 1 => ADD_EDIT
      id: "NCdYgAuRjEYgsRrzQ5W4NC-1", // Identifiant unique pour cette edit
      name: "Ajout de la Description",
      ops: [
        {
          type: 1, // 1 => SET_TRIPLE
          triple: {
            entity: "NCdYgAuRjEYgsRrzQ5W4NC",
            attribute: "LA1DqP5v6QAdsgLPXGF3YA",
            value: {
              type: 1, // 1 => TEXT pour l’API Geo
              value: "Test space.",
            },
          },
        },
      ],
      authors: [
        "0x1234567890abcdef000000000000000000000000", // Même auteur que ci-dessus
      ],
    };

    // 4) Envoyer la requête POST à l’API Geo
    const response = await axios.post(`${GEO_API_URL}/edit`, edit, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("✅ Description ajoutée avec succès :", response.data);

  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("❌ Erreur lors de l'ajout de la Description :", error.response?.data || error.message);
    } else {
      console.error("❌ Erreur lors de l'ajout de la Description :", (error as Error).message);
    }
  }
}

// On exécute la fonction
updateSpace();
