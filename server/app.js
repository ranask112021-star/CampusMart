import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import listingRoutes from "./routes/listings.js";
import orderRoutes from "./routes/orders.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: "connected" });
});

app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found." });
});

app.use((err, req, res, next) => {
  console.error("Request failed:", err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error." });
});

export default app;
