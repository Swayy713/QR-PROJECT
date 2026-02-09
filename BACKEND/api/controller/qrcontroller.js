import {
  allProduct,
  registerProduct,
  verifyProduct,
} from "../service/qrService.js";

//controller for allproduct
export const getAllProduct = async (req, res) => {
  try {
    const products = await allProduct();
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
export const registerNewProduct = async (req, res) => {
  try {
    const { productId, productData } = req.body;

    // Validate required fields
    if (!productId || !productData) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: productId and productData are required",
      });
    }

    const { productName, quantity, brand } = productData;

    const product = await registerProduct(productId, productName, quantity, brand);
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

//controller to verify product
export const verifyProductId = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await verifyProduct(productId);
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
