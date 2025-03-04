import dotenv from "dotenv";
dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) throw new Error("PRIVATE_KEY does not exist in environment");

const rpcUrl = process.env.RPC_URL;
if (!rpcUrl) throw new Error("RPC_URL does not exist in environment");

console.log("🔍 DEBUG - process.env.PRIVATE_KEY:", privateKey);
console.log("🔍 DEBUG - process.env.RPC_URL:", rpcUrl);

export const config = {
    privateKey,
    rpcUrl,
};
