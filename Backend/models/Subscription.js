// models/Subscription.js
import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },

    plan: {
      type: String,
      enum: ["Gold", "Silver", "Platinum"],
      default: "Gold",
    },

    durationMonths: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    // ✅ pending bhi allow karo
    status: {
      type: String,
      enum: ["pending", "active", "inactive", "expired"],
      default: "pending",
    },

    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", SubscriptionSchema);

