import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ["Books", "Electronics", "Cycles", "Furniture", "Clothing", "Hostel items", "Other"],
      default: "Other",
    },
    condition: {
      type: String,
      enum: ["New", "Like new", "Good", "Fair"],
      default: "Good",
    },
    images: [{ url: String, publicId: String }],
    location: { type: String, default: "" },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["available", "sold"], default: "available" },
  },
  { timestamps: true }
);

export default mongoose.model("Listing", listingSchema);