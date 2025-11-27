// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  address: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String, required: true },

  whatsappPhone: { type: String, required: true }, // primary contact (WhatsApp)
  officeNumber: { type: String },                  // optional landline / office number

  gstNumber: { type: String },     // GSTN
  panNumber: { type: String },     // PAN
  aadharNumber: { type: String },  // Aadhar

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

  aboutInfo: { type: String }, // free text about company / services

  bankAccountNumber: { type: String },
  ifscCode: { type: String },
  cancelCheque: { type: String }, // can store URL/path or reference string

  // Keep email/password for admin login or future auth
  email: { type: String, required: false, unique: true, sparse: true },
  password: { type: String, required: false },

  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

const User = mongoose.model("User", userSchema);
export default User;
