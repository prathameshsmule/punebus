// models/Enquiry.js
import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema({
  // Frontend fields

  companyName: { type: String }, // collected by frontend
  companyDetails: { type: String }, // collected by frontend
  contactPersonName: { type: String }, // collected by frontend
  contactNo: { type: String, required: true }, // required in frontend
  email: { type: String },
  address: { type: String }, // personal/alternate address
  companyAddress: { type: String },

  // Membership (required with default)
  membership: {
    type: String,
    enum: ["silver", "gold", "platinum"],
    required: true,
    default: "silver",
  },

  // Store as numberOfFleet internally; map from frontend's fleetCount
  numberOfFleet: { type: Number, min: 0 }, // optional, >= 0 to match frontend

  // status enum (pending/done)
  status: { type: String, enum: ["pending", "done"], default: "pending" },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update updatedAt on save and on findOneAndUpdate
enquirySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

enquirySchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Enquiry = mongoose.model("Enquiry", enquirySchema);
export default Enquiry;
