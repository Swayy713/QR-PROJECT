import { Router } from "express";
import {
  getAllProduct,
  registerNewProduct,
  verifyProductId,
  registerUser,
  loginUser,
  activateProductController
} from "../controller/qrcontroller.js";

const qrRouter = Router();

qrRouter.get("/all", getAllProduct); //route for all product
qrRouter.post("/register", registerNewProduct); //  route for register new product
qrRouter.post("/verify", verifyProductId); // route for verify product
qrRouter.post("/registerUser", registerUser); // route for register user
qrRouter.post("/loginUser", loginUser); // route for login user
qrRouter.post("/activate", activateProductController); // route to activate product

export default qrRouter;
