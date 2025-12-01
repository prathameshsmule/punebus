// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    companyName: { type: String, trim: true },
    name: { type: String, trim: true }, // for staff users
    address: { type: String, trim: true },
    state: { type: String, trim: true },
    city: { type: String, trim: true },
    area: { type: String, trim: true },

    whatsappPhone: { type: String, trim: true },
    officeNumber: { type: String, trim: true },

    gstNumber: { type: String, trim: true },
    panNumber: { type: String, trim: true },
    aadharNumber: { type: String, trim: true },

    role: {
      type: String,
      enum: [
        "driver",
        "Bus vendor",
        "mechanic",
        "cleaner",
        "restaurant",
        "parcel",
        "Dry Cleaner",
        "admin",
        "manager",
        "accountant",
        "branch-head",
        "sales",
      ],
      required: true,
    },

    aboutInfo: { type: String },

    bankAccountNumber: { type: String, trim: true },
    ifscCode: { type: String, trim: true },
    cancelCheque: { type: String, trim: true },

    // ⭐ NEW: PDF URLs for documents
    aadharPdfUrl: { type: String, trim: true },
    bankPdfUrl: { type: String, trim: true },
    certificatePdfUrl: { type: String, trim: true },

    email: { type: String, trim: true, unique: true, sparse: true },
    password: { type: String },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Password hash middleware (for safety if you use save() somewhere)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("User", userSchema);
