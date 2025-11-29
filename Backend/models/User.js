// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Legacy fields (old system)
    name: { type: String }, // old name
    phone: { type: String }, // old phone / mobile
    AddharNo: { type: String }, // old aadhar
    address: { type: String },
    documents: { type: Object },

    // New Business Fields (registration v2)
    companyName: { type: String }, // optional here, controller will validate
    state: { type: String },
    city: { type: String },
    area: { type: String },

    whatsappPhone: { type: String }, // optional here, controller will validate
    officeNumber: { type: String },

    gstNumber: { type: String },
    panNumber: { type: String },
    aadharNumber: { type: String }, // keep both AddharNo & aadharNumber

    aboutInfo: { type: String },

    bankAccountNumber: { type: String },
    ifscCode: { type: String },
    cancelCheque: { type: String }, // store URL or reference text

    // Auth Fields
    email: { type: String, unique: true, sparse: true },
    password: { type: String },

    // Roles
    // ✅ yahan staff roles add kiye: manager, accountant, branchHead, sales
    role: {
      type: String,
      enum: [
        "driver",
        "vendor",
        "mechanic",
        "cleaner",
        "admin",
        "restaurant",
        "parcel",
        "Dry Cleaner",
        "Bus vendor", // keep if already used in DB
        "manager",
        "accountant",
        "branchHead",
        "sales",
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
