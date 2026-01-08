import { Router } from "express";
import {
  getAllProduct,
  registerNewProduct,
  verifyProductId,
} from "../controller/qrcontroller.js";

const qrRouter = Router();

qrRouter.get("/all", getAllProduct); //route for all product
qrRouter.post("/register", registerNewProduct); //  route for register new product
qrRouter.post("/verify", verifyProductId); // route for verify product

export default qrRouter;
