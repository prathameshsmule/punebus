// controllers/subscriptionController.js
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";

/** allowed durations per plan */
const PLAN_DURATION_OPTIONS = {
  Gold: [3, 6, 12],
  Silver: [1, 3, 6],
  Platinum: [6, 12],
};

/** helper to compute endDate from startDate + months */
const computeEndDate = (startDate, months) => {
  if (!startDate || !months) return undefined;
  const sd = new Date(startDate);
  sd.setMonth(sd.getMonth() + parseInt(months));
  return sd;
};

const validatePlanAndDuration = (plan, durationMonths) => {
  if (!plan || !PLAN_DURATION_OPTIONS[plan]) return { ok: false, message: "Invalid plan" };
  const allowed = PLAN_DURATION_OPTIONS[plan];
  if (!allowed.includes(parseInt(durationMonths))) {
    return { ok: false, message: `Invalid duration for ${plan}. Allowed: ${allowed.join(", ")}` };
  }
  return { ok: true };
};

// POST /api/admin/subscription
export const createSubscriptionByAdmin = async (req, res) => {
  const {
    name,
    phone,
    email,
    plan = "Gold",
    durationMonths,
    startDate,
    endDate: suppliedEnd,
    status,
    notes,
  } = req.body;

  if (!name || !phone || !durationMonths || !startDate) {
    return res.status(400).json({ message: "name, phone, durationMonths and startDate required" });
  }

  const planCheck = validatePlanAndDuration(plan, durationMonths);
  if (!planCheck.ok) return res.status(400).json({ message: planCheck.message });

  // compute endDate if not supplied
  const endDate = suppliedEnd ? new Date(suppliedEnd) : computeEndDate(startDate, durationMonths);

  const subscription = new Subscription({
    name,
    phone,
    email,
    plan,
    durationMonths: parseInt(durationMonths),
    startDate: new Date(startDate),
    endDate,
    status: status || "active",
    notes,
    createdBy: req.user?._id,
  });

  await subscription.save();
  res.status(201).json({ message: "Subscription created", subscription });
};

// GET /api/admin/subscriptions
export const listSubscriptions = async (req, res) => {
  const { page = 1, limit = 20, search, plan, status, sort = "createdAt", order = "desc" } = req.query;
  const q = {};
  if (search) {
    q.$or = [
      { name: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (plan) q.plan = plan;
  if (status) q.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Subscription.countDocuments(q);
  const subs = await Subscription.find(q)
    .sort({ [sort]: order === "asc" ? 1 : -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({ total, page: parseInt(page), limit: parseInt(limit), subscriptions: subs });
};

// GET /api/admin/subscription/:id
export const getSubscriptionById = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Subscription id required" });
  const s = await Subscription.findById(id);
  if (!s) return res.status(404).json({ message: "Subscription not found" });
  res.json({ subscription: s });
};

// PUT /api/admin/subscription/:id
export const updateSubscription = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  // if plan or duration changed, validate
  const planToCheck = updates.plan || (await Subscription.findById(id))?.plan;
  const durationToCheck = updates.durationMonths || (await Subscription.findById(id))?.durationMonths;

  const planCheck = validatePlanAndDuration(planToCheck, durationToCheck);
  if (!planCheck.ok) return res.status(400).json({ message: planCheck.message });

  // if startDate or durationMonths changed, recompute endDate unless explicitly provided
  if (updates.startDate && updates.durationMonths && !updates.endDate) {
    updates.endDate = computeEndDate(updates.startDate, updates.durationMonths);
  } else if (updates.startDate && !updates.durationMonths) {
    const existing = await Subscription.findById(id);
    if (existing) updates.endDate = computeEndDate(updates.startDate, existing.durationMonths);
  } else if (!updates.startDate && updates.durationMonths && !updates.endDate) {
    const existing = await Subscription.findById(id);
    if (existing) updates.endDate = computeEndDate(existing.startDate, updates.durationMonths);
  }

  if (updates.durationMonths) updates.durationMonths = parseInt(updates.durationMonths);

  const s = await Subscription.findByIdAndUpdate(id, updates, { new: true });
  if (!s) return res.status(404).json({ message: "Subscription not found" });
  res.json({ message: "Subscription updated", subscription: s });
};

// DELETE /api/admin/subscription/:id
export const deleteSubscription = async (req, res) => {
  const { id } = req.params;
  const s = await Subscription.findByIdAndDelete(id);
  if (!s) return res.status(404).json({ message: "Subscription not found" });
  res.json({ message: "Subscription deleted" });
};
