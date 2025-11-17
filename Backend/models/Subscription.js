// models/Subscription.js
import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  plan: { type: String, enum: ["Gold","Silver","Platinum"], default: "Gold" },
  // allow flexible duration (validate in controller per-plan)
  durationMonths: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ["active","inactive","expired"], default: "active" },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin id
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("Subscription", SubscriptionSchema);
