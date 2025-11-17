import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  createUserByAdmin,
  listByCategory,
  mechanicList,
  getStats,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/adminController.js";

// NEW: import subscription controllers
import {
  createSubscriptionByAdmin,
  listSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
} from "../controllers/subscriptionController.js";

const router = express.Router();

router.use(protect, adminOnly);

// create user
router.post("/user", createUserByAdmin);

// list by role or all: /api/admin/list/:role  (role = driver/vendor/mechanic/cleaner/admin or 'all')
router.get("/list/:role", listByCategory);

// mechanics quick list
router.get("/mechanics", mechanicList);

// new: stats
router.get("/stats", getStats);

// user CRUD by id
router.get("/user/:id", getUserById);
router.put("/user/:id", updateUser);
router.delete("/user/:id", deleteUser);

/**
 * Subscriptions (admin-only)
 * - POST   /api/admin/subscription        -> create subscription (add client who bought plan)
 * - GET    /api/admin/subscriptions      -> list subscriptions (supports ?page=&limit=&search=&plan=&sort=&order=)
 * - GET    /api/admin/subscription/:id   -> get by id
 * - PUT    /api/admin/subscription/:id   -> update
 * - DELETE /api/admin/subscription/:id   -> delete
 */
router.post("/subscription", createSubscriptionByAdmin);
router.get("/subscriptions", listSubscriptions);
router.get("/subscription/:id", getSubscriptionById);
router.put("/subscription/:id", updateSubscription);
router.delete("/subscription/:id", deleteSubscription);

export default router;
