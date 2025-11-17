// routes/enquiryRoutes.js
import express from "express";
import { body } from "express-validator";
import {
  createEnquiry,
  listEnquiries,
  getEnquiry,
  deleteEnquiry,
  updateEnquiryStatus,
} from "../controllers/enquiryController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// public create
router.post(
  "/",
  [
    body("companyName").trim().notEmpty().withMessage("companyName required"),
    body("companyDetails").trim().notEmpty().withMessage("companyDetails required"),
    body("contactPersonName").trim().notEmpty().withMessage("contactPersonName required"),
    body("contactNo")
      .trim()
      .matches(/^\d{10}$/)
      .withMessage("contactNo must be a valid 10-digit number"),
    body("membership")
      .isIn(["silver", "gold", "platinum"])
      .withMessage("invalid membership"),

    // optional fields
    body("email").optional({ checkFalsy: true }).isEmail().withMessage("invalid email"),
    body("numberOfFleet")
      .optional({ nullable: true })
      .isInt({ min: 0 })
      .withMessage("numberOfFleet must be a non-negative integer"),
    body("fleetCount")
      .optional({ nullable: true })
      .isInt({ min: 0 })
      .withMessage("fleetCount must be a non-negative integer"),
    body("address").optional({ checkFalsy: true }).isString(),
    body("companyAddress").optional({ checkFalsy: true }).isString(),
  ],
  createEnquiry
);

// admin endpoints
router.get("/", protect, adminOnly, listEnquiries);
router.get("/:id", protect, adminOnly, getEnquiry);
router.delete("/:id", protect, adminOnly, deleteEnquiry);

router.put(
  "/:id/status",
  protect,
  adminOnly,
  [body("status").isIn(["pending", "done"]).withMessage("invalid status")],
  updateEnquiryStatus
);

export default router;
