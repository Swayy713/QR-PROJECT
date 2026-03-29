import generateNonce from "../utils/nonce.js";
import hashData from "../utils/hash.js";
import { query } from "../config/db.js";
import {
  registerOnChain,
  verifyOnChain,
  updateHashOnChain,
} from "../blockchain/blockchainService.js";
import bcrypt from "bcryptjs";

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
    isActive: false, // Must be explicitly activated by manufacturer
  });

  // D. Register on blockchain FIRST — if this fails, nothing is saved to DB
  await registerOnChain(productId, hash);

  // E. Only save to SQLite after blockchain confirms
  await query(
    "INSERT INTO products (product_id, nonce, product_data) VALUES (?, ?, ?)",
    [productId, currentNonce, productDetails],
  );

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
  const productDataParsed = JSON.parse(foundProduct.product_data);
  
  if (productDataParsed.isActive === false) {
    throw new Error("This product is registered but has not been activated by the manufacturer yet.");
  }

  const originalNonce = foundProduct.nonce;

  // B. Recompute the expected hash using the original nonce
  const localHash = hashData(productId, originalNonce);

  // C. Ask the blockchain if the hash matches (view call — no gas)
  const isValid = await verifyOnChain(productId, localHash);

  if (!isValid) {
    throw new Error(
      "Product Verification Failed! (Already Used or Counterfeit)",
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

export const registerManufacturer = async ({
  userName,
  fullName,
  email,
  password
}) => {
  const alreadyExist = await query("SELECT * FROM users WHERE email = ? OR username = ?", [
    email,
    userName,
  ]);

  if (alreadyExist.rows.length > 0) {
    throw new Error("User already exists with this email or username");
  }

  const userId = generateNonce(12); // Using generateNonce to give a unique id
  const hashedPassword = await bcrypt.hash(password, 10);

  await query(
    "INSERT INTO users (user_id, username, fullname, email, password) VALUES (?, ?, ?, ?, ?)",
    [userId, userName, fullName, email, hashedPassword],
  );

  return {
    userId,
    userName,
    fullName,
    email,
  };
};

export const loginManufacturer = async ({
  email, 
  password
}) => {
  const alreadyExist = await query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);

  if (alreadyExist.rows.length === 0) {
    throw new Error("User does not exist");
  }

  const validPassword = await bcrypt.compare(password, alreadyExist.rows[0].password);

  if (!validPassword) {
    throw new Error("Invalid password");
  }

  return {
    userId: alreadyExist.rows[0].user_id,
    userName: alreadyExist.rows[0].username,
    fullName: alreadyExist.rows[0].fullname,
    email: alreadyExist.rows[0].email,
  };
};

export const activateProduct = async (productId) => {
  const productRes = await query("SELECT * FROM products WHERE product_id = ?", [productId]);
  if (productRes.rows.length === 0) {
    throw new Error("Product does not exist in Database");
  }

  const foundProduct = productRes.rows[0];
  const productData = JSON.parse(foundProduct.product_data);
  
  if (productData.isActive) {
    throw new Error("Product is already activated");
  }

  productData.isActive = true;

  await query("UPDATE products SET product_data = ? WHERE product_id = ?", [
    JSON.stringify(productData),
    productId
  ]);

  return { ...foundProduct, product_data: productData };
};