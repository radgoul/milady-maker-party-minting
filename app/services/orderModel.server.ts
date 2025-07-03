import mongoose from "mongoose";

const ShippingInfoSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  size: String,
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true },
  walletAddress: { type: String, required: true },
  shippingInfo: { type: ShippingInfoSchema, required: true },
  timestamp: { type: Number, required: true },
  isAnonymous: { type: Boolean, required: true },
  tokenIds: [String],
});

export const OrderModel = mongoose.models.Order || mongoose.model("Order", OrderSchema); 