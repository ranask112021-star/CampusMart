import express from "express";
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const clientDist = resolve(dirname(fileURLToPath(import.meta.url)), "../client/dist");
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/.*/, (req, res) => {
    res.sendFile(resolve(clientDist, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("CampusMart API is running.");
  });
}

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exitCode = 1;
  });