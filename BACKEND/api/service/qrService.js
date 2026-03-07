import generateNonce from "../utils/nonce.js";
import hashData from "../utils/hash.js";
import { query } from "../config/db.js";
import {
  registerOnChain,
  verifyOnChain,
  updateHashOnChain,
} from "../blockchain/blockchainService.js";

//get all product function
export const allProduct = async () => {
  try {
    const result = await query("SELECT * FROM products");

    const formattedProducts = result.rows.map((row) => ({
      ...row,
      product_data: JSON.parse(row.product_data),
    }));

    return formattedProducts;
  } catch (error) {
    throw new Error("Failed to fetch products: " + error.message);
  }
};

//register new product function
export const registerProduct = async (
  productId,
  productName,
  quantity,
  brand,
  category,
) => {
  // A. Check if product already exists in SQLite
  const checkProd = await query("SELECT * FROM products WHERE product_id = ?", [
    productId,
  ]);

  if (checkProd.rows.length > 0) {
    throw new Error("Product already exists");
  }

  // B. Generate nonce and hash (nonce is write-once, stored in SQLite forever)
  const currentNonce = generateNonce(8);
  const hash = hashData(productId, currentNonce);

  // C. Prepare product data JSON for SQLite
  const productDetails = JSON.stringify({
    productName,
    quantity,
    brand,
    category,
  });

  // D. Save product + nonce to SQLite
  await query(
    "INSERT INTO products (product_id, nonce, product_data) VALUES (?, ?, ?)",
    [productId, currentNonce, productDetails],
  );

  // E. Register hash on the real Sepolia blockchain
  await registerOnChain(productId, hash);

  return {
    productId,
    nonce: currentNonce,
    hash,
    productDetails: JSON.parse(productDetails),
  };
};

//Verify product
export const verifyProduct = async (productId) => {
  // A. Get the original nonce from SQLite (read-only — never changes after registration)
  const productRes = await query(
    "SELECT * FROM products WHERE product_id = ?",
    [productId],
  );

  if (productRes.rows.length === 0) {
    throw new Error("Product does not exist in Database");
  }

  const foundProduct = productRes.rows[0];
  const originalNonce = foundProduct.nonce;

  // B. Recompute the expected hash using the original nonce
  const localHash = hashData(productId, originalNonce);

  // C. Ask the blockchain if the hash matches (view call — no gas)
  const isValid = await verifyOnChain(productId, localHash);

  if (!isValid) {
    throw new Error(
      "Product Verification Failed! (Already Scanned or Counterfeit)",
    );
  }

  // D. Generate a new nonce + hash and push it on-chain.
  //    The new nonce is NOT saved to SQLite — it's discarded immediately.
  //    So future recomputes always use the original nonce, which will
  //    never match the new on-chain hash → all future scans permanently fail.
  const newNonce = generateNonce(8);
  const newHash = hashData(productId, newNonce);
  await updateHashOnChain(productId, newHash);

  return {
    status: "Verified",
    message: "Product is Authentic. It has now been permanently invalidated.",
    product: {
      ...foundProduct,
      product_data: JSON.parse(foundProduct.product_data),
    },
  };
};
