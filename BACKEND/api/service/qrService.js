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

//get all product function
export const allProduct = () => {
  return productInfo;
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
    hash: hash, // Store the hash for verification
  };
  productInfo.push(newProduct);

  return newProduct; // Return only the new product, not the entire array
};
