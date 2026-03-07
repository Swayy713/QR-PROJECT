import { ethers } from "ethers";
import { createRequire } from "module";
import { config } from "../config/config.js";

const require = createRequire(import.meta.url);
const contractABI = require("./contractABI.json");

// Setup provider and signer once at module load
const provider = new ethers.JsonRpcProvider(config.rpcUrl);
const signer = new ethers.Wallet(config.privateKey, provider);
const contract = new ethers.Contract(config.contractAddress, contractABI, signer);

/**
 * Register a product on the Sepolia blockchain.
 * @param {string} productId
 * @param {string} hash - hex string (0x...) from ethers.solidityPackedKeccak256
 */
export const registerOnChain = async (productId, hash) => {
  try {
    const tx = await contract.registerProduct(productId, hash);
    await tx.wait(); // Wait for tx to be mined
  
  } catch (error) {
    // Parse ethers.js revert errors into clean human-readable messages
    let cleanMessage = "Failed to register product on blockchain.";
    
    if (error.code === "CALL_EXCEPTION" && error.reason) {
      cleanMessage = error.reason; // e.g., "Product already registered"
    } else if (error.message && error.message.includes("Product already registered")) {
      cleanMessage = "Product is already registered on the blockchain.";
    } else if (error.info && error.info.error && error.info.error.message) {
      cleanMessage = error.info.error.message;
    }

    throw new Error(cleanMessage);
  }
};

/**
 * Verify a product's authenticity on-chain.
 * @param {string} productId
 * @param {string} hash - the locally recomputed hash (0x...)
 * @returns {boolean} true if authentic, false if already scanned / counterfeit
 */
export const verifyOnChain = async (productId, hash) => {
  try {
    // verifyProduct is a view function — no tx needed
    const isValid = await contract.verifyProduct(productId, hash);
    return isValid;
  } catch (error) {
    let cleanMessage = "Failed to verify product on blockchain.";
    
    if (error.code === "CALL_EXCEPTION" && error.reason) {
      cleanMessage = error.reason;
    } else if (error.info && error.info.error && error.info.error.message) {
      cleanMessage = error.info.error.message;
    } else if (error.message) {
      cleanMessage = error.message;
    }

    throw new Error(cleanMessage);
  }
};

/**
 * Update the on-chain hash to a random unknowable value after successful verification.
 * This invalidates all future scans permanently.
 * @param {string} productId
 * @param {string} junkHash - 0x-prefixed 32-byte random hex that is never stored
 */
export const updateHashOnChain = async (productId, junkHash) => {
  try {
    const tx = await contract.updateProductHash(productId, junkHash);
    await tx.wait();
    console.log(`🔒 [Blockchain] Hash for "${productId}" rotated. Tx: ${tx.hash}`);
  } catch (error) {
    let cleanMessage = "Failed to update product hash on blockchain.";
    
    if (error.code === "CALL_EXCEPTION" && error.reason) {
      cleanMessage = error.reason;
    } else if (error.info && error.info.error && error.info.error.message) {
      cleanMessage = error.info.error.message;
    } else if (error.message) {
      cleanMessage = error.message;
    }

    throw new Error(cleanMessage);
  }
};
