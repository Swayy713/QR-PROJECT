import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import qrRouter from "./api/routes/qrRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

//middlewares
app.use(express.static(path.join(__dirname, "../FRONTEND"))); // Serve Frontend
app.use(express.json());
app.use(cors());

//health check
app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

//routes
app.use("/api", qrRouter);

export default app;
