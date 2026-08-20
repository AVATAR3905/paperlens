import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import papersRouter from "./routes/papers";
import chatRouter from "./routes/chat";
import { pool } from "./services/db";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/api/papers", papersRouter);
app.use("/api/chat", chatRouter);

if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "paperlens" });
});

async function start() {
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL");
    client.release();

    app.listen(PORT, () => {
      console.log(`PaperLens server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
