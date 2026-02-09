import generateNonce from "../utils/nonce.js";
import hashData from "../utils/hash.js";
import { query } from "../config/db.js";

//get all product function
export const allProduct = async () => {
  try {
    // Fetch all rows
    const result = await query("SELECT * FROM products");

    // Convert the 'product_data' string back into a real JSON object for the frontend
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
) => {
  // A. Check if exists
  const checkProd = await query("SELECT * FROM products WHERE product_id = ?", [
    productId,
  ]);

  if (checkProd.rows.length > 0) {
    throw new Error("Product already exists");
  }

  // B. Generate Security Data
  const currentNonce = generateNonce(8);
  const hash = hashData(productId, currentNonce);

  // C. Prepare Data (Stringify for SQLite)
  const productDetails = JSON.stringify({
    productName,
    quantity,
    brand,
  });

  // D. Save to Product DB
  await query(
    "INSERT INTO products (product_id, nonce, product_data) VALUES (?, ?, ?)",
    [productId, currentNonce, productDetails],
  );

  // E. Save to Mock Blockchain DB (Instead of array push)
  await query("INSERT INTO mock_blockchain (product_id, hash) VALUES (?, ?)", [
    productId,
    hash,
  ]);

  return {
    productId,
    nonce: currentNonce,
    hash, // Return this so you can verify it immediately in Postman
    productDetails: JSON.parse(productDetails),
  };
};

//Verify product
export const verifyProduct = async (productId) => {
  // A. Get product id from database to get nonce
  const productRes = await query(
    "SELECT * FROM products WHERE product_id = ?",
    [productId],
  );

  if (productRes.rows.length === 0) {
    throw new Error("Product does not exist in Database");
  }

  const foundProduct = productRes.rows[0];
  const dbNonce = foundProduct.nonce;

  // Re-calculate hash using local data
  const localHash = hashData(productId, dbNonce);

  // B. Get Blockchain Data
  const chainRes = await query(
    "SELECT * FROM mock_blockchain WHERE product_id = ?",
    [productId],
  );

  if (chainRes.rows.length === 0) {
    throw new Error("Product not found on Blockchain (Fake)");
  }

  const blockData = chainRes.rows[0];

  // C. COMPARE
  if (blockData.hash !== localHash) {
    throw new Error("Product Verification Failed! ( Already Scanned?)");
  }

  // generate a new random hash and update the 'blockchain' table
  const newRandomNonce = generateNonce(8);
  const newRandomHash = hashData(productId, newRandomNonce);

  await query("UPDATE mock_blockchain SET hash = ? WHERE product_id = ?", [
    newRandomHash,
    productId,
  ]);

  return {
    status: "Verified",
    message: "Product is Authentic. It has now been invalidated.",
    product: {
      ...foundProduct,
      product_data: JSON.parse(foundProduct.product_data),
    },
  };
};
