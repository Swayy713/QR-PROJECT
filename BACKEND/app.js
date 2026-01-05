import express from "express";
import cors from "cors";
import qrRouter from "./api/routes/qrRoutes.js";

const app = express();

//middlewares
app.use(express.json());
app.use(cors());

//health check
app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

//routes
app.use("/api", qrRouter);

export default app;
