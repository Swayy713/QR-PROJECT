import { Router } from "express";
import {
  getAllProduct,
  registerNewProduct,
} from "../controller/qrcontroller.js";

const qrRouter = Router();

qrRouter.get("/all", getAllProduct); //route for all product
qrRouter.post("/register", registerNewProduct); //  route for register new product

export default qrRouter;
