// routes/admin.js
import express from "express";
import { protect, adminOnly, staffOrAdmin } from "../middleware/auth.js";

import {
  createUserByAdmin,
  listByCategory,
  mechanicList,
  getStats,
  getUserById,
  updateUser,
  deleteUser,
  listStaffUsers,
} from "../controllers/adminController.js";

import {
  createSubscriptionByAdmin,
  listSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
} from "../controllers/subscriptionController.js";

const router = express.Router();

// 🔐 sab admin routes pe login required
router.use(protect);

/* -------------------- USER MANAGEMENT (ADMIN ONLY) -------------------- */

router.post("/user", adminOnly, createUserByAdmin);

router.get("/list/:role", adminOnly, listByCategory);

router.get("/staff", adminOnly, listStaffUsers);

router.get("/mechanics", adminOnly, mechanicList);

router.get("/stats", adminOnly, getStats);

router.get("/user/:id", adminOnly, getUserById);
router.put("/user/:id", adminOnly, updateUser);
router.delete("/user/:id", adminOnly, deleteUser);

/* -------------------- SUBSCRIPTIONS -------------------- */
/**
 *  - Create:
 *      admin  -> status active (ya jo bheje)
 *      sales  -> status always "pending"
 *  - List / detail:
 *      admin + manager + accountant + branchHead + sales (read-only)
 *  - Update / delete:
 *      sirf admin
 */

// ✅ create: admin OR sales
router.post(
  "/subscription",
  (req, res, next) => {
    const role = req.user?.role;
    if (role === "admin" || role === "sales") return next();
    return res
      .status(403)
      .json({ message: "Only admin or sales can create subscriptions" });
  },
  createSubscriptionByAdmin
);

// ✅ list & get: koi bhi internal staff / admin
router.get("/subscriptions", staffOrAdmin, listSubscriptions);
router.get("/subscription/:id", staffOrAdmin, getSubscriptionById);

// ✅ update & delete: sirf admin
router.put("/subscription/:id", adminOnly, updateSubscription);
router.delete("/subscription/:id", adminOnly, deleteSubscription);

export default router;
