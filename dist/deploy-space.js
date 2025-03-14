import { getChecksumAddress } from "@graphprotocol/grc-20";
const requestBody = JSON.stringify({
    initialEditorAddress: getChecksumAddress("0xdbAcd0A6Fb4a2f8F423D3f68519d7DBBb71BfBae"),
    spaceName: "Armando RSS",
});
const result = await fetch("https://api-testnet.grc-20.thegraph.com/deploy", {
    method: "POST",
    body: requestBody,
});
const responseText = await result.text();
console.log("🔍 API Response:", responseText);
try {
    const responseJson = JSON.parse(responseText);
    console.log("✅ Parsed JSON:", responseJson);
}
catch (error) {
    console.error("❌ Erreur JSON:", error);
}
