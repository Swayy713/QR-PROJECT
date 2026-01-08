import {
  allProduct,
  registerProduct,
  verifyProduct,
} from "../service/qrService.js";

//controller for allproduct
export const getAllProduct = (req, res) => {
  try {
    const products = allProduct();
    res.status(200).json({
      success: true,
      message: "All products",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//controller for register new product
export const registerNewProduct = (req, res) => {
  try {
    const { productId, productData } = req.body;

    // Validate required fields
    if (!productId || !productData) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: productId, productData, and nonce are required",
      });
    }

    const { productName, quantity, brand, maunfacturedDate, expiryDate } =
      productData;

    const product = registerProduct(
      productId,
      productName,
      quantity,
      brand,
      maunfacturedDate,
      expiryDate
    );
    res.status(201).json({
      success: true,
      message: "Product registered successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
      error: error.message,
    });
  }
};

export const verifyProductId = (req, res) => {
  try {
    const { productId } = req.body;
    const product = verifyProduct(productId);
    res.status(200).json({
      success: true,
      message: "Product verified successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
      error: error.message,
    });
  }
};
