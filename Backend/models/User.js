import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: false },
  email: { type: String, required: false, unique: true, sparse: true },
  password: { type: String, required: false }, // for admin or if user sets password
  role: {
    type: String,
    enum: ["driver", "vendor", "mechanic", "cleaner", "admin", "restaurant", "parcel"],
    required: true,
  },
  AddharNo: { type: String }, // optional for drivers/vendors
  address: { type: String },
  documents: { type: Object }, // store doc links or metadata
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const User = mongoose.model("User", userSchema);
export default User;
