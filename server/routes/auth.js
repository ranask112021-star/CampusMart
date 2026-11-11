import express from "express";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import protect from "../middleware/auth.js";

const router = express.Router();

const makeToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const userData = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  college: u.college,
  role: u.role,
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, college } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "This email is already registered." });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, college });
    res.status(201).json({ token: makeToken(user._id), user: userData(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter your email and password." });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Incorrect email or password." });
    }
    res.json({ token: makeToken(user._id), user: userData(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(503).json({
        message: "Password reset is unavailable until an email provider is configured.",
      });
    }

    if (typeof req.body.email !== "string" || !req.body.email.trim()) {
      return res.status(400).json({ message: "Please enter your email address." });
    }
    const email = req.body.email.trim().toLowerCase();

    const user = await User.findOne({ email });
    if (user) {
      const resetToken = randomBytes(32).toString("hex");
      const passwordResetTokenHash = createHash("sha256").update(resetToken).digest("hex");
      const passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

      await User.updateOne(
        { _id: user._id },
        { $set: { passwordResetTokenHash, passwordResetExpires } }
      );

      const clientUrl = (process.env.CLIENT_URL || "http://localhost:5174").replace(/\/+$/, "");
      console.info(`[CampusMart] Local password reset link (expires in 15 minutes): ${clientUrl}/reset-password/${resetToken}`);
    }

    res.json({
      message: "If an account exists for that email, a reset link has been printed in the local server console.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(503).json({
        message: "Password reset is unavailable until an email provider is configured.",
      });
    }

    const { token, password } = req.body;
    if (typeof token !== "string" || typeof password !== "string" || !token || !password) {
      return res.status(400).json({ message: "A reset token and new password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const passwordResetTokenHash = createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetTokenHash,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetTokenHash +passwordResetExpires");

    if (!user) {
      return res.status(400).json({ message: "This reset link is invalid or has expired. Request a new one." });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", protect, (req, res) => {
  res.json({ user: userData(req.user) });
});

export default router;