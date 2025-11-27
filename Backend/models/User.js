// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // New Business Fields
    companyName: { type: String, required: true },
    address: { type: String },
    state: { type: String },
    city: { type: String },
    area: { type: String },

    whatsappPhone: { type: String, required: true },
    officeNumber: { type: String },

    gstNumber: { type: String },
    panNumber: { type: String },
    aadharNumber: { type: String },

    aboutInfo: { type: String },

    bankAccountNumber: { type: String },
    ifscCode: { type: String },
    cancelCheque: { type: String }, // store URL or base64

    // Auth Fields
    email: { type: String, unique: true, sparse: true },
    password: { type: String },

    // Roles
    role: {
      type: String,
      enum: [
        "driver",
        "Bus vendor",
        "mechanic",
        "cleaner",
        "admin",
        "restaurant",
        "parcel",
        "Dry Cleaner",
      ],
      required: true,
    },

    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
