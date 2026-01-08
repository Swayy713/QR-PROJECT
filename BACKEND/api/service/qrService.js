import generateNonce from "../utils/nonce.js";
import hashData from "../utils/hash.js";

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
export const registerProduct = (
  productId,
  productName,
  quantity,
  brand,
  maunfacturedDate,
  expiryDate
) => {
  const isAlreadyExist = productInfo.find(
    (product) => product.productId === productId
  );

  if (isAlreadyExist) {
    throw new Error("Product already exist");
  }

  const currentNonce = generateNonce(8);
  const hash = hashData(productId, currentNonce);

  const newProduct = {
    productId,
    productData: {
      productName,
      quantity,
      brand,
      maunfacturedDate,
      expiryDate,
    },
    nonce: currentNonce,
  };

  const blockData = {
    productId,
    hash: hash, // Store the hash for verification
  };
  productInfo.push(newProduct);

  blockChain.push(blockData);

  return newProduct; // Return only the new product, not the entire array
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
