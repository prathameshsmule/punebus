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

// Pehle sirf auth check
router.use(protect);

/* ========== USER MANAGEMENT ========== */

// ✅ sirf admin: naya user/staff create kare
router.post("/user", adminOnly, createUserByAdmin);

// ✅ admin + staff: users list dekh sakte (driver/vendor/…)
router.get("/list/:role", staffOrAdmin, listByCategory);

// ✅ sirf admin: internal staff list (manager/accountant/…)
router.get("/staff", adminOnly, listStaffUsers);

// ✅ admin + staff: mechanics quick list
router.get("/mechanics", staffOrAdmin, mechanicList);

// ✅ admin + staff: stats dashboard numbers
router.get("/stats", staffOrAdmin, getStats);

// ✅ sirf admin: single user CRUD
router.get("/user/:id", adminOnly, getUserById);
router.put("/user/:id", adminOnly, updateUser);
router.delete("/user/:id", adminOnly, deleteUser);

/* ========== SUBSCRIPTIONS ========== */

// ✅ admin + sales: subscription create kar sakte
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

// ✅ admin + staff (manager/accountant/branchHead/sales) list & view
router.get("/subscriptions", staffOrAdmin, listSubscriptions);
router.get("/subscription/:id", staffOrAdmin, getSubscriptionById);

// ✅ sirf admin: status update / delete
router.put("/subscription/:id", adminOnly, updateSubscription);
router.delete("/subscription/:id", adminOnly, deleteSubscription);

export default router;
