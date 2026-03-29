import {
  allProduct,
  registerProduct,
  verifyProduct,
  registerManufacturer,
  loginManufacturer,
  activateProduct
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

    const { productName, quantity, brand, category } = productData;

    const product = await registerProduct(
      productId,
      productName,
      quantity,
      brand,
      category,
    );
    res.status(201).json({
      success: true,
      message: "Product registered successfully",
      data: product,
    });
  } catch (error) {
    let cleanMessage = error.message || "Internal Server Error";
    
    // Parse ethers.js revert string to extract just the reason
    if (cleanMessage.includes("execution reverted:")) {
      const match = cleanMessage.match(/execution reverted: \\?"?(.*?)\\?"?(?:\s|\(|$)/);
      if (match && match[1]) {
        cleanMessage = match[1];
      }
    }

    res.status(500).json({
      success: false,
      message: cleanMessage,
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
    let cleanMessage = error.message || "Internal Server Error";
    
    // Parse ethers.js revert string to extract just the reason
    if (cleanMessage.includes("execution reverted:")) {
      const match = cleanMessage.match(/execution reverted: \\?"?(.*?)\\?"?(?:\s|\(|$)/);
      if (match && match[1]) {
        cleanMessage = match[1];
      }
    }

    res.status(500).json({
      success: false,
      message: cleanMessage,
    });
  }
};

export const registerUser = async (req, res) => {
  try {
    const {userName, fullName, email, password} = req.body;

    if (!userName || !fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const user = await registerManufacturer({
      userName,
      fullName,
      email,
      password
    });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
   } catch (error) {
    const isClientError = error.message === "Invalid password" || error.message === "User does not exist" || error.message.includes("already exists");
    
    res.status(isClientError ? 400 : 500).json({
      success: false,
      message: isClientError ? error.message : "Internal Server Error",
      error: isClientError ? undefined : error.message,
    });
  }
}


export const loginUser  = async (req, res) => {
  try {
    const {email, password} = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const user = await loginManufacturer({
      email,
      password
    });
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: user,
    });
   } catch (error) {
    const isClientError = error.message === "Invalid password" || error.message === "User does not exist" || error.message.includes("already exists");
    
    res.status(isClientError ? 400 : 500).json({
      success: false,
      message: isClientError ? error.message : "Internal Server Error",
      error: isClientError ? undefined : error.message,
    });
  }
}

export const activateProductController = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Missing productId",
      });
    }

    const product = await activateProduct(productId);
    res.status(200).json({
      success: true,
      message: "Product activated successfully",
      data: product,
    });
  } catch (error) {
    const isClientError = error.message.includes("does not exist") || error.message.includes("already activated");
    res.status(isClientError ? 400 : 500).json({
      success: false,
      message: isClientError ? error.message : "Internal Server Error",
    });
  }
};