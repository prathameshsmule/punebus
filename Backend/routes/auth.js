import express from "express";
import { registerUser, adminLogin } from "../controllers/authController.js";

const router = express.Router();

/**
 * POST /api/auth/register
 * Body: { name, phone, email?, role, vehicleNumber?, address?, documents? }
 * public registration (not admin)
 */
router.post("/register", registerUser);

/**
 * POST /api/auth/admin/login
 * Body: { email, password }
 */
router.post("/admin/login", adminLogin);

export default router;
