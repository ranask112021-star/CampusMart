import express from "express";
import mongoose from "mongoose";
import Listing from "../models/Listing.js";
import protect from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";

const router = express.Router();

// Nayi listing banao (login + 1 se 4 photos)
router.post("/", protect, upload.array("images", 4), async (req, res) => {
  try {
    const { title, description, price, category, condition, location } = req.body;
    if (!title || price === undefined || price === "") {
      return res.status(400).json({ message: "Title aur price zaroori hain" });
    }
    if (isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ message: "Price sahi number hona chahiye" });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Kam se kam 1 photo daalo" });
    }

    const images = [];
    for (const file of req.files) {
      const result = await uploadImage(file.buffer);
      images.push({ url: result.secure_url, publicId: result.public_id });
    }

    const listing = await Listing.create({
      title,
      description,
      price: Number(price),
      category,
      condition,
      location,
      images,
      seller: req.user._id,
    });
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Sab listings (search, filter, pagination)
router.get("/", async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
    const filter = { status: "available" };

    if (q) filter.title = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 12, 1), 50);

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate("seller", "name college")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Listing.countDocuments(filter),
    ]);

    res.json({ listings, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Meri apni listings
router.get("/mine", protect, async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Ek listing
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Galat listing id" });
    }
    const listing = await Listing.findById(req.params.id).populate("seller", "name college email");
    if (!listing) return res.status(404).json({ message: "Listing nahi mili" });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Listing update (sirf owner ya admin)
router.put("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Galat listing id" });
    }
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing nahi mili" });

    const isOwner = listing.seller.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Yeh listing aapki nahi hai" });
    }

    const fields = ["title", "description", "price", "category", "condition", "location", "status"];
    for (const f of fields) {
      if (req.body[f] !== undefined) listing[f] = req.body[f];
    }
    await listing.save();
    res.json(listing);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Listing delete (sirf owner ya admin)
router.delete("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Galat listing id" });
    }
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing nahi mili" });

    const isOwner = listing.seller.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Yeh listing aapki nahi hai" });
    }

    for (const img of listing.images) {
      if (img.publicId) await deleteImage(img.publicId);
    }
    await listing.deleteOne();
    res.json({ message: "Listing delete ho gayi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;