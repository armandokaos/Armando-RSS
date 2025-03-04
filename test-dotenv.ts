import dotenv from "dotenv"; import path from "path"; dotenv.config({ path: path.resolve(process.cwd(), ".env") }); console.log("PK:", process.env.PK); console.log("RPC:", process.env.RPC);
