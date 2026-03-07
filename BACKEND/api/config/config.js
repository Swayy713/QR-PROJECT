import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT,
  rpcUrl: process.env.RPC_URL,
  privateKey: process.env.PRIVATE_KEY,
  contractAddress: process.env.CONTRACT_ADDRESS,
};
