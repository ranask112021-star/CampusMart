import express from "express";
import mongoose from "mongoose";
import Listing from "../models/Listing.js";
import Order from "../models/Order.js";
import protect from "../middleware/auth.js";

const router = express.Router();

const releaseListings = async (listingIds) => {
  await Promise.all(
    listingIds.map((id) => Listing.updateOne({ _id: id, status: "sold" }, { $set: { status: "available" } }))
  );
};

router.post("/", protect, async (req, res) => {
  const { listingIds, deliveryAddress } = req.body;
  if (
    !Array.isArray(listingIds) ||
    listingIds.length === 0 ||
    listingIds.length > 20 ||
    listingIds.some((id) => !mongoose.isValidObjectId(id)) ||
    new Set(listingIds.map(String)).size !== listingIds.length
  ) {
    return res.status(400).json({ message: "Select between 1 and 20 unique listings." });
  }

  const requiredAddressFields = ["recipientName", "phone", "addressLine", "locality", "city", "state", "postalCode"];
  if (
    !deliveryAddress ||
    requiredAddressFields.some(
      (field) => typeof deliveryAddress[field] !== "string" || !deliveryAddress[field].trim()
    )
  ) {
    return res.status(400).json({ message: "Recipient name, phone, delivery address, and city are required." });
  }
  if (!/^[+0-9()\-\s]{7,20}$/.test(deliveryAddress.phone.trim())) {
    return res.status(400).json({ message: "Enter a valid phone number." });
  }

  const claimed = [];
  try {
    const items = [];
    for (const id of listingIds) {
      const listing = await Listing.findOneAndUpdate(
        { _id: id, status: "available", seller: { $ne: req.user._id } },
        { $set: { status: "sold" } },
        { new: true }
      );
      if (!listing) {
        await releaseListings(claimed);
        return res.status(409).json({
          message: "One or more items are unavailable or belong to you. Refresh your cart and try again.",
        });
      }
      claimed.push(listing._id);
      items.push({
        listing: listing._id,
        seller: listing.seller,
        title: listing.title,
        price: listing.price,
        image: listing.images[0]?.url || "",
      });
    }

    const order = await Order.create({
      buyer: req.user._id,
      items,
      deliveryAddress,
      paymentMethod: "cash_on_delivery",
    });
    res.status(201).json(order);
  } catch (err) {
    if (claimed.length) await releaseListings(claimed);
    res.status(500).json({ message: "Could not place the order. Please try again." });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("items.seller", "name college")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Could not load your orders." });
  }
});

router.get("/selling", protect, async (req, res) => {
  try {
    const orders = await Order.find({ "items.seller": req.user._id })
      .populate("buyer", "name")
      .populate("items.seller", "name")
      .sort({ createdAt: -1 });
    res.json(
      orders.map((order) => ({
        ...order.toObject(),
        items: order.items.filter((item) => item.seller._id.equals(req.user._id)),
      }))
    );
  } catch (err) {
    res.status(500).json({ message: "Could not load orders for your listings." });
  }
});

router.get("/:orderId", protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.orderId)) {
    return res.status(400).json({ message: "Invalid order ID." });
  }
  try {
    const order = await Order.findOne({ _id: req.params.orderId, buyer: req.user._id })
      .populate("items.seller", "name college");
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Could not load the order receipt." });
  }
});

router.put("/:orderId/items/:listingId/status", protect, async (req, res) => {
  const { orderId, listingId } = req.params;
  const { status } = req.body;
  if (!mongoose.isValidObjectId(orderId) || !mongoose.isValidObjectId(listingId)) {
    return res.status(400).json({ message: "Invalid order or listing ID." });
  }
  if (!["confirmed", "dispatched", "delivered"].includes(status)) {
    return res.status(400).json({ message: "Invalid order status." });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found." });
    const item = order.items.find((entry) => entry.listing.equals(listingId));
    if (!item) return res.status(404).json({ message: "Item not found in this order." });

    const isBuyer = order.buyer.equals(req.user._id);
    const isSeller = item.seller.equals(req.user._id);
    const sellerTransition =
      isSeller &&
      ((item.status === "placed" && status === "confirmed") ||
        (item.status === "confirmed" && status === "dispatched"));
    const buyerTransition = isBuyer && item.status === "dispatched" && status === "delivered";
    if (!sellerTransition && !buyerTransition) {
      return res.status(403).json({ message: "You cannot make this order status change." });
    }

    const result = await Order.updateOne(
      {
        _id: order._id,
        items: { $elemMatch: { listing: item.listing, status: item.status } },
      },
      { $set: { "items.$.status": status } }
    );
    if (!result.modifiedCount) {
      return res.status(409).json({ message: "The order changed. Refresh and try again." });
    }
    res.json({ status });
  } catch (err) {
    res.status(500).json({ message: "Could not update the order status." });
  }
});

export default router;
