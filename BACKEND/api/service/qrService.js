import generateNonce from "../utils/nonce.js";
import hashData from "../utils/hash.js";
import { query } from "../config/db.js";

//database
const productInfo = [
  {
    productId: "qjeyr1123jd",
    productData: {
      productName: "Gala",
      quantity: "100g",
      brand: "Uac food",
      maunfacturedDate: "1-1-2025",
      expiryDate: "1-3-2025",
    },
    nonce: "1wert45",
  },
  {
    productId: "qjeyr1123kd",
    productData: {
      productName: "Malt",
      quantity: "100g",
      brand: "Uac Drink",
      maunfacturedDate: "1-1-2025",
      expiryDate: "1-3-2025",
    },
    nonce: "1werv45",
  },
];

const blockChain = [];

//get all product function
export const allProduct = () => {
  return [productInfo, blockChain];
};

//register new product function
export const registerProduct = async (
  productId,
  productName,
  quantity,
  brand,
  manufacturedDate, // Fixed spelling
  expiryDate
) => {
  // 1. CHECK IF EXISTS
  // Fix: Removed quotes around $1 and used correct column name 'product_id'
  const checkProd = await query(
    "SELECT * FROM products WHERE product_id = $1",
    [productId]
  );

  if (checkProd.rows.length > 0) {
    throw new Error("Product already exists");
  }

  // 2. GENERATE SECURITY DATA
  const currentNonce = generateNonce(8);
  const hash = hashData(productId, currentNonce);

  // 3. PREPARE THE JSON DATA
  // We bundle the details into one object to fit into the 'product_data' column
  const productDetails = {
    productName,
    quantity,
    brand,
    manufacturedDate,
    expiryDate,
  };

  // 4. SAVE TO DATABASE (The Fix)
  // We insert into only 3 columns: product_id, nonce, and product_data
  await query(
    "INSERT INTO products (product_id, nonce, product_data) VALUES ($1, $2, $3)",
    [
      productId, // Matches $1
      currentNonce, // Matches $2
      productDetails, // Matches $3 (Neon/Postgres automatically stringifies this)
    ]
  );

  // 5. UPDATE BLOCKCHAIN (Simulation)
  const blockData = {
    productId,
    hash: hash,
  };
  blockChain.push(blockData);

  // 6. RETURN SUCCESS
  return {
    productId,
    nonce: currentNonce,
    productDetails,
  };
};

export const verifyProduct = (productId) => {
  const foundProduct = productInfo.find(
    (product) => product.productId === productId
  );

  if (!foundProduct) {
    throw new Error("Product is not exist");
  }

  const dbNonce = foundProduct.nonce;
  const localHash = hashData(productId, dbNonce);

  const blockIndex = blockChain.findIndex(
    (block) => block.productId === productId
  );

  if (blockIndex === -1) {
    throw new Error("Product not found on Blockchain");
  }

  const blockData = blockChain[blockIndex];

  // 4. THE COMPARISON (The Moment of Truth)
  if (blockData.hash !== localHash) {
    // If they don't match, it means the blockchain has been updated already!
    throw new Error("Product Verification Failed! (Already Scanned or Fake)");
  }

  const newRandomNonce = generateNonce(8);
  const newRandomHash = hashData(productId, newRandomNonce);

  // 6. UPDATE THE BLOCKCHAIN ONLY
  blockChain[blockIndex] = {
    productId,
    hash: newRandomHash,
  };

  return {
    status: "Verified",
    message:
      "Product is Authentic. It has now been invalidated for future scans.",
    product: foundProduct,
  };
};
