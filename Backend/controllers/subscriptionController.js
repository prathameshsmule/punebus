// controllers/subscriptionController.js
import Subscription from "../models/Subscription.js";

/** allowed durations per plan */
const PLAN_DURATION_OPTIONS = {
  Gold: [3, 6, 12],
  Silver: [1, 3, 6, 12],
  Platinum: [6, 12],
};

/** helper to compute endDate from startDate + months */
const computeEndDate = (startDate, months) => {
  if (!startDate || !months) return undefined;
  const sd = new Date(startDate);
  sd.setMonth(sd.getMonth() + parseInt(months, 10));
  return sd;
};

const validatePlanAndDuration = (plan, durationMonths) => {
  if (!plan || !PLAN_DURATION_OPTIONS[plan]) {
    return { ok: false, message: "Invalid plan" };
  }
  const allowed = PLAN_DURATION_OPTIONS[plan];
  if (!allowed.includes(parseInt(durationMonths, 10))) {
    return {
      ok: false,
      message: `Invalid duration for ${plan}. Allowed: ${allowed.join(", ")}`,
    };
  }
  return { ok: true };
};

/**
 * POST /api/admin/subscription
 * - Admin create kare to status default "active" (ya jo body me diya ho)
 * - Sales create kare to status hamesha "pending"
 */
export const createSubscriptionByAdmin = async (req, res) => {
  const {
    name,
    phone,
    email,
    plan = "Gold",
    durationMonths,
    startDate,
    endDate: suppliedEnd,
    status, // admin ke liye optional
    notes,
  } = req.body;

  if (!name || !phone || !durationMonths || !startDate) {
    return res
      .status(400)
      .json({ message: "name, phone, durationMonths and startDate required" });
  }

  const planCheck = validatePlanAndDuration(plan, durationMonths);
  if (!planCheck.ok) return res.status(400).json({ message: planCheck.message });

  const endDate = suppliedEnd
    ? new Date(suppliedEnd)
    : computeEndDate(startDate, durationMonths);

  const role = req.user?.role;

  // admin -> active/inactive/expired/pending (jo bheje)
  // sales -> always pending
  let finalStatus = "active";
  if (role === "sales") {
    finalStatus = "pending";
  } else if (
    status &&
    ["pending", "active", "inactive", "expired"].includes(status)
  ) {
    finalStatus = status;
  }

  const subscription = new Subscription({
    name,
    phone,
    email,
    plan,
    durationMonths: parseInt(durationMonths, 10),
    startDate: new Date(startDate),
    endDate,
    status: finalStatus,
    notes,
    createdBy: req.user?._id || null,
  });

  await subscription.save();
  res.status(201).json({ message: "Subscription created", subscription });
};

/**
 * GET /api/admin/subscriptions
 * - Admin / Manager / Accountant / BranchHead / Sales sab dekh sakte
 * - Sales user sirf apne createdBy wale records dekh sakta
 * - Optional filters: ?search=&plan=&status=&createdBy=&page=&limit=
 */
export const listSubscriptions = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    plan,
    status,
    sort = "createdAt",
    order = "desc",
    createdBy,
  } = req.query;

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

  const role = req.user?.role;

  // sales -> always filter by own id
  if (role === "sales") {
    q.createdBy = req.user._id;
  } else if (createdBy) {
    // admin/manager/accountant/branchHead can filter by createdBy
    q.createdBy = createdBy;
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const total = await Subscription.countDocuments(q);
  const subs = await Subscription.find(q)
    .sort({ [sort]: order === "asc" ? 1 : -1 })
    .skip(skip)
    .limit(parseInt(limit, 10));

  res.json({
    total,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    subscriptions: subs,
  });
};

export const getSubscriptionById = async (req, res) => {
  const { id } = req.params;
  if (!id)
    return res.status(400).json({ message: "Subscription id required" });

  const s = await Subscription.findById(id);
  if (!s) return res.status(404).json({ message: "Subscription not found" });

  res.json({ subscription: s });
};

export const updateSubscription = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  const existing = await Subscription.findById(id);
  if (!existing) {
    return res.status(404).json({ message: "Subscription not found" });
  }

  const planToCheck = updates.plan || existing.plan;
  const durationToCheck = updates.durationMonths || existing.durationMonths;

  const planCheck = validatePlanAndDuration(planToCheck, durationToCheck);
  if (!planCheck.ok) return res.status(400).json({ message: planCheck.message });

  // recompute endDate when start/duration changed & no explicit endDate
  if (updates.startDate || updates.durationMonths) {
    const start = updates.startDate || existing.startDate;
    const dur = updates.durationMonths || existing.durationMonths;
    if (!updates.endDate) {
      updates.endDate = computeEndDate(start, dur);
    }
  }

  if (updates.durationMonths) {
    updates.durationMonths = parseInt(updates.durationMonths, 10);
  }

  const s = await Subscription.findByIdAndUpdate(id, updates, { new: true });
  res.json({ message: "Subscription updated", subscription: s });
};

export const deleteSubscription = async (req, res) => {
  const { id } = req.params;
  const s = await Subscription.findByIdAndDelete(id);
  if (!s) {
    return res.status(404).json({ message: "Subscription not found" });
  }
  res.json({ message: "Subscription deleted" });
};
