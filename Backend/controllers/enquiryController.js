// controllers/enquiryController.js
import Enquiry from "../models/Enquiry.js";
import { validationResult } from "express-validator";

export const createEnquiry = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const {
    companyName = "",
    companyDetails = "",
    contactPersonName = "",
    contactNo = "",
    email,
    address,
    companyAddress,
    membership,
    numberOfFleet,
    fleetCount,
  } = req.body;

  const resolvedFleet =
    numberOfFleet != null
      ? Number(numberOfFleet)
      : fleetCount != null && `${fleetCount}` !== ""
      ? Number(fleetCount)
      : undefined;

  const doc = new Enquiry({
    companyName: companyName.trim(),
    companyDetails: companyDetails.trim(),
    contactPersonName: contactPersonName.trim(),
    contactNo: `${contactNo}`.trim(),
    email: email?.trim(),
    address: address?.trim(),
    companyAddress: companyAddress?.trim(),
    membership,
    ...(resolvedFleet != null && !Number.isNaN(resolvedFleet)
      ? { numberOfFleet: resolvedFleet }
      : {}),
  });

  await doc.save();
  res.status(201).json({ message: "Enquiry received", enquiry: doc });
};


export const listEnquiries = async (req, res) => {
  const items = await Enquiry.find().sort({ createdAt: -1 }).limit(200);
  res.json({ total: items.length, items });
};

export const getEnquiry = async (req, res) => {
  const item = await Enquiry.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json({ item });
};

export const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Enquiry.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Enquiry not found" });
    res.json({ message: "Enquiry deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while deleting enquiry" });
  }
};

// update status (admin only)
export const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "done"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Enquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Enquiry not found" });

    res.json({ message: "Status updated", enquiry: updated });
  } catch (err) {
    console.error("updateEnquiryStatus:", err);
    res.status(500).json({ message: "Server error while updating status" });
  }
};
