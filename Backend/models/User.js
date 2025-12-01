// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Legacy fields (old system)
    name: { type: String },
    phone: { type: String },
    AddharNo: { type: String },
    address: { type: String },
    documents: { type: Object },

    // New Business Fields
    companyName: { type: String },
    state: { type: String },
    city: { type: String },
    area: { type: String },

    whatsappPhone: { type: String },
    officeNumber: { type: String },

    gstNumber: { type: String },
    panNumber: { type: String },
    aadharNumber: { type: String },

    aboutInfo: { type: String },

    bankAccountNumber: { type: String },
    ifscCode: { type: String },
    cancelCheque: { type: String }, // URL or reference text

    // NEW: PDF document URLs
    aadharPdfUrl: { type: String },
    bankPdfUrl: { type: String },
    certificatePdfUrl: { type: String },

    // Auth Fields
    email: { type: String, unique: true, sparse: true },
    password: { type: String },

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
        "Bus vendor",
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
