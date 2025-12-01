// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Basic info
    companyName: { type: String, required: true },
    address: { type: String },
    state: { type: String },
    city: { type: String },
    area: { type: String },

    // Contacts
    whatsappPhone: { type: String, required: true },
    officeNumber: { type: String },

    // IDs
    gstNumber: { type: String },
    panNumber: { type: String },
    aadharNumber: { type: String },

    // Role
    role: { type: String, required: true },

    // Extra info
    aboutInfo: { type: String },

    // Bank
    bankAccountNumber: { type: String },
    ifscCode: { type: String },
    cancelCheque: { type: String },

    // Login
    email: { type: String },
    password: { type: String },

    // ⭐ PDFs ke URLs
    aadharPdfUrl: { type: String },
    bankPdfUrl: { type: String },
    certificatePdfUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

// 👇 yahi sahi pattern hai
const User = mongoose.model("User", userSchema);
export default User;
