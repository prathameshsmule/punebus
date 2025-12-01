// routes/auth.js
import express from "express";
import { registerUser, adminLogin } from "../controllers/authController.js";

const router = express.Router();

/**
 * POST /api/auth/register
 * Body:
 * {
 *   companyName,
 *   address,
 *   state,
 *   city,
 *   area,
 *   whatsappPhone,
 *   officeNumber?,
 *   gstNumber?,
 *   panNumber?,
 *   aadharNumber?,
 *   role,
 *   aboutInfo?,
 *   bankAccountNumber?,
 *   ifscCode?,
 *   cancelCheque?
 * }
 * Public registration (not admin)
 */
router.post("/register", registerUser);

/**
 * POST /api/auth/admin/login
 * Body: { email, password, role }
 */
router.post("/admin/login", adminLogin);

export default router;
