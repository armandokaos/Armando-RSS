import { getChecksumAddress } from "@graphprotocol/grc-20";

// Calcul de l'adresse checksum et log
const initialEditorAddress = getChecksumAddress("0x2899BF69BCA6407CA8C8A3A43363F16Cc6ea9999");
console.log("Initial Editor Address (Checksum):", initialEditorAddress);

const requestBody = JSON.stringify({
  initialEditorAddress,
  spaceName: "Armando RSS",
});
console.log("Request Body:", requestBody);

// Mesure du temps de la requête
const startTime = Date.now();
console.log("Démarrage de la requête fetch à", new Date(startTime).toISOString());

const result = await fetch("https://api-testnet.grc-20.thegraph.com/deploy", {
  method: "POST",
  body: requestBody,
});

const endTime = Date.now();
console.log("Fin de la requête fetch à", new Date(endTime).toISOString());
console.log("Durée de la requête (ms):", endTime - startTime);

// Statut HTTP et vérification de la réussite
console.log("Requête fetch terminée. Statut HTTP:", result.status);
if (!result.ok) {
  console.error("Erreur HTTP détectée. Code:", result.status);
}

// Affichage des headers de la réponse pour plus d'info
console.log("Response Headers:");
result.headers.forEach((value, name) => {
  console.log(`${name}: ${value}`);
});

// Lecture du corps de la réponse
const responseText = await result.text();
console.log("🔍 API Response (raw):", responseText);

// Tentative de parsing du JSON et log détaillé
try {
  const responseJson = JSON.parse(responseText);
  console.log("✅ Parsed JSON:", responseJson);
} catch (error) {
  console.error("❌ Erreur lors du parsing du JSON:", error);
}
