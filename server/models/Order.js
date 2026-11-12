import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    status: {
      type: String,
      enum: ["placed", "confirmed", "dispatched", "delivered"],
      default: "placed",
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], validate: [(items) => items.length > 0, "An order needs at least one item."] },
    deliveryAddress: {
      recipientName: { type: String, required: true, trim: true, maxlength: 80 },
      phone: { type: String, required: true, trim: true, maxlength: 20 },
      addressLine: { type: String, required: true, trim: true, maxlength: 200 },
      locality: { type: String, required: true, trim: true, maxlength: 100 },
      landmark: { type: String, trim: true, maxlength: 100, default: "" },
      campus: { type: String, trim: true, maxlength: 100, default: "" },
      city: { type: String, required: true, trim: true, maxlength: 80 },
      state: { type: String, required: true, trim: true, maxlength: 80 },
      postalCode: { type: String, required: true, trim: true, maxlength: 12 },
    },
    paymentMethod: { type: String, enum: ["cash_on_delivery"], default: "cash_on_delivery" },
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
