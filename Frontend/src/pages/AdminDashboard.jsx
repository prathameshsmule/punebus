// src/pages/AdminDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import api from "../api/apiClient";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

// Tabs / filtering roles for main users table (partners etc.)
const ROLES = [
  "all",
  "driver",
  "Bus vendor",
  "mechanic",
  "cleaner",
  "restaurant",
  "parcel",
  "Dry Cleaner",
];

// State / city options (same idea as Register)
const STATE_OPTIONS = [
  "Maharashtra",
  "Karnataka",
  "Gujarat",
  "Delhi",
  "Tamil Nadu",
  "Other",
];

const CITY_OPTIONS_BY_STATE = {
  Maharashtra: ["Pune", "Mumbai", "Nagpur", "Nashik", "Other"],
  Karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Other"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Other"],
  Delhi: ["New Delhi", "Dwarka", "Saket", "Rohini", "Other"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Other"],
  Other: ["Other"],
};

// internal staff roles
const STAFF_ROLES = ["admin", "manager", "accountant", "branch-head", "sales"];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("driver");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  // MODALS
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddSubscriptionModal, setShowAddSubscriptionModal] =
    useState(false);

  // NEW USER STRUCTURE (partners)
  const [newUser, setNewUser] = useState({
    companyName: "",
    address: "",
    state: "",
    city: "",
    area: "",
    whatsappPhone: "",
    officeNumber: "",
    gstNumber: "",
    panNumber: "",
    aadharNumber: "",
    role: "driver",
    aboutInfo: "",
    bankAccountNumber: "",
    ifscCode: "",
    cancelCheque: "",
    email: "",
    password: "",
  });

  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // Enquiries
  const [showEnquiries, setShowEnquiries] = useState(false);
  const [enquiries, setEnquiries] = useState([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);

  // Subscriptions
  const [showSubscriptionsPanel, setShowSubscriptionsPanel] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [subPage, setSubPage] = useState(1);
  const [subLimit] = useState(10);
  const [subTotal, setSubTotal] = useState(0);
  const [subSearch, setSubSearch] = useState("");
  const [subscriptionForm, setSubscriptionForm] = useState({
    name: "",
    phone: "",
    email: "",
    plan: "Gold",
    durationMonths: 3,
    startDate: "",
    endDate: "",
    notes: "",
  });
  const subscriptionPlans = ["Gold", "Silver", "Platinum"];
  const durationOptions = [3, 6, 12];

  // Staff / Roles section
  const [showStaffPanel, setShowStaffPanel] = useState(false);
  const [staffUsers, setStaffUsers] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    aadharNumber: "",
    address: "",
    role: "manager",
  });

  // responsive
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // modal refs
  const deleteCancelRef = useRef(null);
  const deleteConfirmRef = useRef(null);

  // body scroll lock when any modal open
  useEffect(() => {
    const open =
      showEditModal ||
      showDeleteModal ||
      showAddUserModal ||
      showAddSubscriptionModal ||
      showAddStaffModal;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [
    showEditModal,
    showDeleteModal,
    showAddUserModal,
    showAddSubscriptionModal,
    showAddStaffModal,
  ]);

  // ESC to close modals
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (showEditModal) {
          setShowEditModal(false);
          setEditingUser(null);
        }
        if (showDeleteModal) {
          setShowDeleteModal(false);
          setDeletingUser(null);
        }
        if (showAddUserModal) {
          setShowAddUserModal(false);
        }
        if (showAddSubscriptionModal) {
          setShowAddSubscriptionModal(false);
        }
        if (showAddStaffModal) {
          setShowAddStaffModal(false);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    showEditModal,
    showDeleteModal,
    showAddUserModal,
    showAddSubscriptionModal,
    showAddStaffModal,
  ]);

  // ----------------------------
  // Backend interactions
  // ----------------------------

  // fetch stats
  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error("fetchStats:", err);
    }
  };

  // fetch users (partners list per role tabs)
  const fetchUsers = async (
    role = activeTab,
    pageParam = page,
    searchParam = search
  ) => {
    if (!role) {
      setUsers([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const roleParam = role === "all" ? "all" : role;
      const qp = new URLSearchParams({
        page: pageParam,
        limit,
        search: searchParam || "",
      });
      const res = await api.get(`/admin/list/${roleParam}?${qp.toString()}`);
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("fetchUsers:", err);
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // fetch staff / roles (internal users)
  const fetchStaffUsers = async () => {
    setLoadingStaff(true);
    try {
      // get all users with big limit, filter staff roles on frontend
      const qp = new URLSearchParams({
        page: 1,
        limit: 1000,
        search: "",
      });
      const res = await api.get(`/admin/list/all?${qp.toString()}`);
      const list = res.data.users || [];
      const staff = list.filter((u) => STAFF_ROLES.includes(u.role));
      setStaffUsers(staff);
    } catch (err) {
      console.error("fetchStaffUsers:", err);
      setStaffUsers([]);
    } finally {
      setLoadingStaff(false);
    }
  };

  // fetch enquiries
  const fetchEnquiries = async () => {
    setLoadingEnquiries(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/enquiry", {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });

      let list = [];
      if (Array.isArray(res.data)) list = res.data;
      else if (Array.isArray(res.data.items)) list = res.data.items;
      else if (Array.isArray(res.data.enquiries)) list = res.data.enquiries;
      else if (Array.isArray(res.data.data)) list = res.data.data;

      const normalized = list.map((e) => ({
        _id: e._id,
        contactNo: e.contactNo || e.phone || "-",
        email: e.email || "-",
        address: e.address || "-",
        membership: e.membership || e.service || "-",
        companyName: e.companyName || "-",
        companyDetails: e.companyDetails || "-",
        contactPersonName: e.contactPersonName || "-",
        companyAddress: e.companyAddress || "-",
        numberOfFleet:
          typeof e.numberOfFleet === "number"
            ? e.numberOfFleet
            : typeof e.fleetCount === "number"
            ? e.fleetCount
            : e.numberOfFleet ?? e.fleetCount ?? "-",
        status: e.status || "pending",
        createdAt: e.createdAt || null,
      }));

      setEnquiries(normalized);
    } catch (err) {
      console.error("fetchEnquiries:", err);
      setEnquiries([]);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  // Subscriptions list
  const fetchSubscriptions = async (
    pageParam = subPage,
    searchParam = subSearch
  ) => {
    setLoadingSubscriptions(true);
    try {
      const qp = new URLSearchParams({
        page: pageParam,
        limit: subLimit,
        search: searchParam || "",
      });
      const res = await api.get(`/admin/subscriptions?${qp.toString()}`);
      if (res?.data) {
        setSubscriptions(res.data.subscriptions || []);
        setSubTotal(res.data.total || 0);
      } else {
        setSubscriptions([]);
        setSubTotal(0);
      }
    } catch (err) {
      console.error("fetchSubscriptions:", err);
      setSubscriptions([]);
      setSubTotal(0);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  // helper to compute end date (months) - same logic as backend
  const computeEndDate = (startDateStr, months) => {
    if (!startDateStr || !months) return "";
    try {
      const sd = new Date(`${startDateStr}T00:00:00`);
      sd.setMonth(sd.getMonth() + parseInt(months, 10));
      const yyyy = sd.getFullYear();
      const mm = String(sd.getMonth() + 1).padStart(2, "0");
      const dd = String(sd.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    } catch (e) {
      return "";
    }
  };

  // update endDate when startDate or duration changes
  useEffect(() => {
    const { startDate, durationMonths } = subscriptionForm;
    if (startDate && durationMonths) {
      const ed = computeEndDate(startDate, durationMonths);
      setSubscriptionForm((prev) => ({ ...prev, endDate: ed }));
    } else {
      setSubscriptionForm((prev) => ({ ...prev, endDate: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionForm.startDate, subscriptionForm.durationMonths]);

  // create subscription
  const handleCreateSubscription = async (e) => {
    e?.preventDefault?.();
    const { name, phone, durationMonths, startDate } = subscriptionForm;
    if (!name || !phone || !durationMonths || !startDate) {
      alert("Name, phone, duration and start date are required");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...subscriptionForm,
        durationMonths: parseInt(subscriptionForm.durationMonths, 10),
      };
      const res = await api.post("/admin/subscription", payload, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      alert(res.data?.message || "Subscription created");
      setSubscriptionForm({
        name: "",
        phone: "",
        email: "",
        plan: "Gold",
        durationMonths: 3,
        startDate: "",
        endDate: "",
        notes: "",
      });
      setShowAddSubscriptionModal(false);
      fetchSubscriptions(1, "");
      setSubPage(1);
      fetchStats();
    } catch (err) {
      console.error("create subscription err:", err);
      alert(err?.response?.data?.message || "Failed to create subscription");
    }
  };

  // ⭐ NEW: update subscription status (pending / active / inactive / expired)
  const handleUpdateSubscriptionStatus = async (id, newStatus) => {
    const allowed = ["pending", "active", "inactive", "expired"];
    if (!allowed.includes(newStatus)) {
      alert("Invalid status");
      return;
    }

    const prevStatus =
      subscriptions.find((s) => s._id === id)?.status || "pending";

    // optimistic UI update
    setSubscriptions((prev) =>
      prev.map((s) => (s._id === id ? { ...s, status: newStatus } : s))
    );

    try {
      await api.put(`/admin/subscription/${id}`, { status: newStatus });
      fetchStats();
    } catch (err) {
      console.error("update subscription status err:", err);
      alert(
        err?.response?.data?.message || "Failed to update subscription status"
      );
      // rollback on error
      setSubscriptions((prev) =>
        prev.map((s) => (s._id === id ? { ...s, status: prevStatus } : s))
      );
    }
  };

  // delete subscription
  const handleDeleteSubscription = async (id) => {
    if (!window.confirm("Delete this subscription?")) return;
    try {
      await api.delete(`/admin/subscription/${id}`);
      alert("Subscription deleted");
      fetchSubscriptions(subPage, subSearch);
      fetchStats();
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  const goSubPage = (p) => {
    setSubPage(p);
    fetchSubscriptions(p, subSearch);
  };

  // enquiries: change status
  const handleChangeEnquiryStatus = async (id, newStatus) => {
    if (!["pending", "done"].includes(newStatus)) {
      alert("Invalid status value");
      return;
    }
    const old = enquiries.find((e) => e._id === id)?.status || "pending";
    setEnquiries((prev) =>
      prev.map((e) => (e._id === id ? { ...e, status: newStatus } : e))
    );
    try {
      const token = localStorage.getItem("token");
      const res = await api.put(
        `/enquiry/${id}/status`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (res?.data?.enquiry) {
        setEnquiries((prev) =>
          prev.map((e) => (e._id === id ? res.data.enquiry : e))
        );
      }
      fetchStats();
    } catch (err) {
      console.error(
        "[AdminDashboard] Failed to update enquiry status - full error:",
        err
      );
      if (err?.response) {
        alert(
          err.response.data?.message ||
            JSON.stringify(err.response.data) ||
            "Failed to update status"
        );
      } else {
        alert(err.message || "Failed to update status");
      }
      setEnquiries((prev) =>
        prev.map((e) => (e._id === id ? { ...e, status: old } : e))
      );
      fetchEnquiries();
    }
  };

  const handleDeleteEnquiry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?"))
      return;
    try {
      await api.delete(`/enquiry/${id}`);
      setEnquiries((prev) => prev.filter((e) => e._id !== id));
      fetchStats();
      alert("Enquiry deleted");
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  // users: create (partners)
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/admin/user", newUser);
      alert(res.data.message || "User created");
      setNewUser({
        companyName: "",
        address: "",
        state: "",
        city: "",
        area: "",
        whatsappPhone: "",
        officeNumber: "",
        gstNumber: "",
        panNumber: "",
        aadharNumber: "",
        role: "driver",
        aboutInfo: "",
        bankAccountNumber: "",
        ifscCode: "",
        cancelCheque: "",
        email: "",
        password: "",
      });
      setShowAddUserModal(false);
      setPage(1);
      fetchUsers(activeTab || "driver", 1, "");
      fetchStats();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create user");
    }
  };

  // staff: create (roles)
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    const { name, email, password, phone, aadharNumber, address, role } =
      staffForm;
    if (!name || !password || !phone || !role) {
      alert("Name, phone, password and role are required");
      return;
    }
    try {
      const payload = {
        companyName: name,
        name,
        email,
        password,
        whatsappPhone: phone,
        aadharNumber,
        address,
        role,
      };
      const res = await api.post("/admin/user", payload);
      alert(res.data?.message || "Staff / role user created");
      setStaffForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        aadharNumber: "",
        address: "",
        role: "manager",
      });
      setShowAddStaffModal(false);
      fetchStaffUsers();
      fetchStats();
    } catch (err) {
      console.error("create staff err:", err);
      alert(err?.response?.data?.message || "Failed to create staff user");
    }
  };

  // users: edit
  const openEdit = (user) => {
    setEditingUser({
      ...user,
      password: "",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const updates = { ...editingUser };
      if (!updates.password) delete updates.password;
      const res = await api.put(`/admin/user/${editingUser._id}`, updates);
      alert(res.data.message || "User updated");
      setShowEditModal(false);
      setEditingUser(null);
      if (showStaffPanel) {
        fetchStaffUsers();
      } else {
        fetchUsers(activeTab, page, search);
      }
      fetchStats();
    } catch (err) {
      alert(err?.response?.data?.message || "Update failed");
    }
  };

  // users: delete
  const openDelete = (user) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
    setTimeout(() => deleteCancelRef.current?.focus(), 50);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;
    try {
      const res = await api.delete(`/admin/user/${deletingUser._id}`);
      alert(res.data.message || "User deleted");
      setShowDeleteModal(false);
      setDeletingUser(null);
      const newTotal = Math.max(0, total - 1);
      const lastPage = Math.max(1, Math.ceil(newTotal / limit));
      if (!showStaffPanel) {
        if (page > lastPage) setPage(lastPage);
        fetchUsers(activeTab, page > lastPage ? lastPage : page, search);
      } else {
        fetchStaffUsers();
      }
      fetchStats();
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  // tab changes (partners)
  const changeTab = (r) => {
    setActiveTab(r === "all" ? "all" : r);
    setPage(1);
    setSearch("");
    setShowEnquiries(false);
    setShowSubscriptionsPanel(false);
    setShowStaffPanel(false);
    setShowAddUserModal(false);
    setShowAddSubscriptionModal(false);
    setShowAddStaffModal(false);
  };

  const toggleEnquiries = () => {
    const next = !showEnquiries;
    setShowEnquiries(next);
    setShowSubscriptionsPanel(false);
    setShowStaffPanel(false);
    setShowAddUserModal(false);
    setShowAddSubscriptionModal(false);
    setShowAddStaffModal(false);
    if (next) {
      setActiveTab(null);
      fetchEnquiries();
    } else {
      setActiveTab("driver");
    }
  };

  const toggleSubscriptions = () => {
    const next = !showSubscriptionsPanel;
    setShowSubscriptionsPanel(next);
    setShowEnquiries(false);
    setShowStaffPanel(false);
    setShowAddUserModal(false);
    setShowAddSubscriptionModal(false);
    setShowAddStaffModal(false);
    if (next) {
      setActiveTab(null);
      setSubPage(1);
      setSubSearch("");
      fetchSubscriptions(1, "");
    } else {
      setActiveTab("driver");
    }
  };

  const toggleStaffPanel = () => {
    const next = !showStaffPanel;
    setShowStaffPanel(next);
    setShowEnquiries(false);
    setShowSubscriptionsPanel(false);
    setShowAddUserModal(false);
    setShowAddSubscriptionModal(false);
    if (next) {
      setActiveTab(null);
      fetchStaffUsers();
    } else {
      setActiveTab("driver");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(activeTab, 1, search);
  };

  const handleSubSearchSubmit = (e) => {
    e.preventDefault();
    setSubPage(1);
    fetchSubscriptions(1, subSearch);
  };

  const goPage = (p) => {
    setPage(p);
    fetchUsers(activeTab, p, search);
  };

  useEffect(() => {
    fetchStats();
    fetchUsers(activeTab, 1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab) fetchUsers(activeTab, page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page]);

  const roleLabel = (r) =>
    r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1);

  const getRoleColor = (role) => {
    const colors = {
      admin: "#ef4444",
      manager: "#6366f1",
      accountant: "#22c55e",
      "branch-head": "#0ea5e9",
      sales: "#facc15",
      driver: "#3b82f6",
      "Bus vendor": "#a855f7",
      mechanic: "#f97316",
      cleaner: "#10b981",
      restaurant: "#22c55e",
      parcel: "#0ea5e9",
      "Dry Cleaner": "#14b8a6",
    };
    return colors[role] || "#6b7280";
  };

  // URL helper for PDF files
const getPdfUrl = (path) => {
  if (!path) return null;

  // agar backend se full http/https aa rha hai to seedha use karo
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // agar /uploads/... jaisa relative path aa rha hai
  return `${window.location.origin}${path.startsWith("/") ? "" : "/"}${path}`;
};

  // ----------------------------
  // Export helpers (PDF & Excel)
  // ----------------------------

  const exportToPDF = (title, columns, rows, fileName) => {
    if (!rows || rows.length === 0) {
      alert("No data to export");
      return;
    }
    const doc = new jsPDF();
    doc.text(title, 14, 16);
    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 22,
      styles: { fontSize: 8 },
    });
    doc.save(fileName);
  };

  const exportToExcel = (columns, rows, fileName) => {
    if (!rows || rows.length === 0) {
      alert("No data to export");
      return;
    }
    const data = [columns, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, fileName);
  };

  // Users export (partners)
  const handleExportUsersExcel = () => {
    const cols = [
      "Company",
      "State",
      "City",
      "Area",
      "WhatsApp Phone",
      "Office No.",
      "Role",
      "GSTN",
      "PAN",
      "Aadhar",
      "Bank A/c",
      "IFSC",
      "Cancel Cheque",
      "Email",
      "About",
      "Address",
    ];
    const rows = users.map((u) => [
      u.companyName,
      u.state || "-",
      u.city || "-",
      u.area || "-",
      u.whatsappPhone || "-",
      u.officeNumber || "-",
      u.role || "-",
      u.gstNumber || "-",
      u.panNumber || "-",
      u.aadharNumber || "-",
      u.bankAccountNumber || "-",
      u.ifscCode || "-",
      u.cancelCheque || "-",
      u.email || "-",
      u.aboutInfo || "-",
      u.address || "-",
    ]);
    exportToExcel(cols, rows, `users-${activeTab || "all"}.xlsx`);
  };

  // Staff export
  const handleExportStaffExcel = () => {
    const cols = ["Name", "Role", "Email", "Phone", "Aadhar", "Address"];
    const rows = staffUsers.map((u) => [
      u.companyName || u.name || "-",
      u.role || "-",
      u.email || "-",
      u.whatsappPhone || u.officeNumber || "-",
      u.aadharNumber || "-",
      u.address || "-",
    ]);
    exportToExcel(cols, rows, "staff-roles.xlsx");
  };

  // Enquiries export
  const handleExportEnquiriesExcel = () => {
    const cols = [
      "Company",
      "Contact Person",
      "Contact No.",
      "Email",
      "Membership",
      "Company Details",
      "Company Address",
      "Address",
      "Fleet",
      "Date",
      "Status",
    ];
    const rows = enquiries.map((eq) => [
      eq.companyName,
      eq.contactPersonName,
      eq.contactNo,
      eq.email,
      eq.membership,
      eq.companyDetails,
      eq.companyAddress,
      eq.address,
      eq.numberOfFleet ?? "-",
      eq.createdAt ? new Date(eq.createdAt).toLocaleString() : "-",
      eq.status,
    ]);
    exportToExcel(cols, rows, "enquiries.xlsx");
  };

  // Subscriptions export
  const handleExportSubscriptionsExcel = () => {
    const cols = [
      "Name",
      "Phone",
      "Email",
      "Plan",
      "Duration (months)",
      "Start Date",
      "End Date",
      "Status",
      "Notes",
    ];
    const rows = subscriptions.map((s) => [
      s.name,
      s.phone,
      s.email || "-",
      s.plan,
      s.durationMonths,
      s.startDate ? new Date(s.startDate).toLocaleDateString() : "-",
      s.endDate ? new Date(s.endDate).toLocaleDateString() : "-",
      s.status,
      s.notes || "",
    ]);
    exportToExcel(cols, rows, "subscriptions.xlsx");
  };

  // ----------------------------
  // Cards render helpers
  // ----------------------------

  // Enquiry mobile card
  const renderEnquiryCard = (eq) => (
    <div
      key={eq._id}
      style={{
        background: "white",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, color: "#111827", fontSize: 15 }}>
            {eq.companyName !== "-"
              ? eq.companyName
              : eq.contactPersonName !== "-"
              ? eq.contactPersonName
              : "—"}
          </div>

          {eq.contactPersonName && eq.contactPersonName !== "-" && (
            <div
              style={{
                fontSize: 13,
                color: "#111827",
                marginTop: 6,
                fontWeight: 700,
              }}
            >
              Contact Person:{" "}
              <span style={{ fontWeight: 800 }}>{eq.contactPersonName}</span>
            </div>
          )}

          <div
            style={{
              fontSize: 13,
              color: "#6b7280",
              marginTop: 4,
            }}
          >
            Membership: <strong>{eq.membership}</strong>
          </div>

          {eq.companyDetails && eq.companyDetails !== "-" && (
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                color: "#374151",
              }}
            >
              {eq.companyDetails}
            </div>
          )}

          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: "#374151",
            }}
          >
            <div>
              Contact: <strong>{eq.contactNo}</strong>
              {eq.email && eq.email !== "-" ? ` • ${eq.email}` : ""}
            </div>
            {eq.address && eq.address !== "-" && (
              <div>Address: {eq.address}</div>
            )}
            {eq.companyAddress && eq.companyAddress !== "-" && (
              <div>Company Address: {eq.companyAddress}</div>
            )}
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: "#111827",
              fontWeight: 700,
            }}
          >
            Fleet:{" "}
            <span style={{ fontWeight: 800 }}>{eq.numberOfFleet ?? "-"}</span>
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "#6b7280",
            }}
          >
            {eq.createdAt ? new Date(eq.createdAt).toLocaleString() : "-"}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minWidth: 140,
          }}
        >
          <div>
            <select
              value={eq.status || "pending"}
              onChange={(e) => handleChangeEnquiryStatus(eq._id, e.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                fontWeight: 700,
                width: "100%",
              }}
            >
              <option value="pending">Pending</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => navigator.clipboard?.writeText(eq._id)}
              style={editBtnStyle}
            >
              Copy ID
            </button>
            <button
              onClick={() => handleDeleteEnquiry(eq._id)}
              style={deleteBtnStyle}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // User mobile card (partners)
  const renderUserCard = (u) => (
    <div
      key={u._id}
      style={{
        background: "white",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontWeight: 800, color: "#111827", fontSize: 15 }}>
              {u.companyName || "—"}
            </div>
            <div
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                background: `${getRoleColor(u.role)}20`,
                color: getRoleColor(u.role),
              }}
            >
              {u.role}
            </div>
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: "#374151",
            }}
          >
            Location:{" "}
            <strong>
              {(u.area && `${u.area}, `) || ""}
              {u.city || "-"}, {u.state || "-"}
            </strong>
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: "#374151",
            }}
          >
            WhatsApp: <strong>{u.whatsappPhone || "-"}</strong>
          </div>
          {u.officeNumber && (
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: "#374151",
              }}
            >
              Office: {u.officeNumber}
            </div>
          )}
          {u.email && (
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: "#6b7280",
              }}
            >
              {u.email}
            </div>
          )}

          {u.address && (
            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                color: "#374151",
              }}
            >
              {u.address}
            </div>
          )}

          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "#6b7280",
            }}
          >
            GST: {u.gstNumber || "-"} | PAN: {u.panNumber || "-"} | Aadhar:{" "}
            {u.aadharNumber || "-"}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minWidth: 120,
          }}
        >
          <button onClick={() => openEdit(u)} style={editBtnStyle}>
            Edit
          </button>
          <button onClick={() => openDelete(u)} style={deleteBtnStyle}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // Staff / role mobile card
  const renderStaffCard = (u) => (
    <div
      key={u._id}
      style={{
        background: "white",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontWeight: 800, color: "#111827", fontSize: 15 }}>
              {u.companyName || u.name || "—"}
            </div>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                background: `${getRoleColor(u.role)}20`,
                color: getRoleColor(u.role),
              }}
            >
              {u.role}
            </span>
          </div>
          {u.email && (
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                color: "#6b7280",
              }}
            >
              {u.email}
            </div>
          )}
          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              color: "#374151",
            }}
          >
            Phone: <strong>{u.whatsappPhone || u.officeNumber || "-"}</strong>
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              color: "#374151",
            }}
          >
            Aadhar: {u.aadharNumber || "-"}
          </div>
          {u.address && (
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: "#374151",
              }}
            >
              {u.address}
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minWidth: 120,
          }}
        >
          <button onClick={() => openEdit(u)} style={editBtnStyle}>
            Edit
          </button>
          <button onClick={() => openDelete(u)} style={deleteBtnStyle}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // --- SEARCH / CONTROL STYLES ADJUSTED FOR MOBILE ---
  const searchInputStyle = {
    ...inputStyle,
    minWidth: isMobile ? 0 : 220,
    flex: isMobile ? "1 1 auto" : "0 0 auto",
  };
  const searchFormStyle = {
    display: "flex",
    gap: 8,
    width: isMobile ? "100%" : "auto",
    alignItems: "center",
    flexShrink: 1,
  };
  const searchBtnStyle = {
    padding: isMobile ? "8px 10px" : "9px 12px",
    background: "#1f2937",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    flexShrink: 0,
  };
  const addBtnStyle = {
    padding: isMobile ? "8px 10px" : "9px 14px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    whiteSpace: "nowrap",
    flexShrink: 0,
  };
  const enquiryBtnStyle = {
    padding: isMobile ? "8px 10px" : "9px 14px",
    background: showEnquiries
      ? "linear-gradient(135deg,#f97316, #fb923c)"
      : "#f3f4f6",
    color: showEnquiries ? "white" : "#374151",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    flexShrink: 0,
  };
  const subscriptionBtnStyle = {
    padding: isMobile ? "8px 10px" : "9px 14px",
    background: showSubscriptionsPanel
      ? "linear-gradient(135deg,#6366f1, #8b5cf6)"
      : "#f3f4f6",
    color: showSubscriptionsPanel ? "white" : "#374151",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    flexShrink: 0,
  };
  const staffBtnStyle = {
    padding: isMobile ? "8px 10px" : "9px 14px",
    background: showStaffPanel
      ? "linear-gradient(135deg,#22c55e, #16a34a)"
      : "#f3f4f6",
    color: showStaffPanel ? "white" : "#374151",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    flexShrink: 0,
  };

  const availableUserCities =
    CITY_OPTIONS_BY_STATE[newUser.state] || CITY_OPTIONS_BY_STATE["Other"];

  const availableEditCities =
    editingUser && editingUser.state
      ? CITY_OPTIONS_BY_STATE[editingUser.state] ||
        CITY_OPTIONS_BY_STATE["Other"]
      : CITY_OPTIONS_BY_STATE["Other"];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
        padding: isMobile ? 12 : 16,
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: isMobile ? 22 : 30,
              fontWeight: 800,
              color: "#1f2937",
              marginBottom: 6,
            }}
          >
            Admin Dashboard
          </h1>
          <p
            style={{
              color: "#6b7280",
              fontSize: isMobile ? 13 : 14,
            }}
          >
            Manage your users, enquiries, subscriptions and internal staff roles
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr 1fr"
              : "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {!stats ? (
            <div
              style={{
                gridColumn: "1/-1",
                textAlign: "center",
                padding: 20,
                color: "#6b7280",
              }}
            >
              Loading stats...
            </div>
          ) : (
            <>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  borderRadius: 12,
                  padding: 18,
                  color: "white",
                  boxShadow: "0 8px 10px rgba(0,0,0,0.08)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.95,
                    marginBottom: 4,
                  }}
                >
                  Total Users
                </div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>
                  {stats.total}
                </div>
              </div>
              {Object.entries(stats.counts || {}).map(([role, count]) => (
                <div
                  key={role}
                  style={{
                    background: "white",
                    borderRadius: 12,
                    padding: 18,
                    boxShadow: "0 4px 6px rgba(0,0,0,0.04)",
                    border: "1px solid #eaeefb",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  >
                    {role}
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#1f2937",
                    }}
                  >
                    {count}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Controls */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 12,
              alignItems: isMobile ? "stretch" : "center",
              justifyContent: "space-between",
            }}
          >
            {/* Partner roles tabs */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => changeTab(r)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    background:
                      activeTab === r
                        ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                        : "#f3f4f6",
                    color: activeTab === r ? "white" : "#374151",
                    boxShadow:
                      activeTab === r
                        ? "0 6px 10px rgba(99,102,241,0.15)"
                        : "none",
                    transition: "all 0.18s",
                    flexShrink: 0,
                  }}
                >
                  {roleLabel(r)}
                </button>
              ))}
            </div>

            {/* Right side buttons */}
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginTop: isMobile ? 8 : 0,
                flexWrap: "wrap",
              }}
            >
              <form onSubmit={handleSearchSubmit} style={searchFormStyle}>
                <input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={searchInputStyle}
                />
                <button type="submit" style={searchBtnStyle}>
                  Search
                </button>
              </form>

              <button
                onClick={() => setShowAddUserModal(true)}
                style={addBtnStyle}
              >
                + Add Partner
              </button>

              <button onClick={toggleEnquiries} style={enquiryBtnStyle}>
                {showEnquiries ? "Hide Enquiries" : "Enquiries"}
              </button>

              <button onClick={toggleSubscriptions} style={subscriptionBtnStyle}>
                {showSubscriptionsPanel
                  ? "Hide Subscriptions"
                  : "Subscriptions"}
              </button>

              <button onClick={toggleStaffPanel} style={staffBtnStyle}>
                {showStaffPanel ? "Hide Staff / Roles" : "Staff / Roles"}
              </button>
            </div>
          </div>
        </div>

        {/* Subscriptions Panel */}
        {showSubscriptionsPanel && (
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Subscriptions</h3>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <form
                  onSubmit={handleSubSearchSubmit}
                  style={{ display: "flex", gap: 8 }}
                >
                  <input
                    placeholder="Search subscriptions..."
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                    style={{ ...inputStyle, minWidth: 220 }}
                  />
                  <button type="submit" style={searchBtnStyle}>
                    Search
                  </button>
                </form>
                <div
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                  }}
                >
                  {loadingSubscriptions ? "Loading..." : `${subTotal} total`}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={handleExportSubscriptionsExcel}
                    style={exportBtnStyle}
                  >
                    Download Excel
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSubscriptionModal(true)}
                    style={primaryButtonStyle}
                  >
                    + Add Subscription
                  </button>
                </div>
              </div>
            </div>

            {loadingSubscriptions ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 20,
                  color: "#6b7280",
                }}
              >
                Loading subscriptions...
              </div>
            ) : subscriptions.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 20,
                  color: "#6b7280",
                }}
              >
                No subscriptions found.
              </div>
            ) : isMobile ? (
              <div>
                {subscriptions.map((s) => (
                  <div
                    key={s._id}
                    style={{
                      background: "white",
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 10,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 800,
                        color: "#111827",
                        fontSize: 15,
                      }}
                    >
                      {s.name}
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 13,
                        color: "#374151",
                      }}
                    >
                      {s.phone}
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 13,
                        color: "#6b7280",
                      }}
                    >
                      {s.email || "-"}
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 13,
                        color: "#111827",
                      }}
                    >
                      {s.plan} • {s.durationMonths} months
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: "#6b7280",
                      }}
                    >
                      {s.startDate
                        ? new Date(s.startDate).toLocaleDateString()
                        : "-"}{" "}
                      →{" "}
                      {s.endDate
                        ? new Date(s.endDate).toLocaleDateString()
                        : "-"}
                    </div>
                    {/* ⭐ UPDATED: mobile status dropdown */}
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: "#6b7280",
                      }}
                    >
                      Status:{" "}
                      <select
                        value={s.status || "pending"}
                        onChange={(e) =>
                          handleUpdateSubscriptionStatus(
                            s._id,
                            e.target.value
                          )
                        }
                        style={{
                          padding: "4px 8px",
                          borderRadius: 8,
                          border: "1px solid #d1d5db",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button
                        onClick={() => navigator.clipboard?.writeText(s._id)}
                        style={editBtnStyle}
                      >
                        Copy ID
                      </button>
                      <button
                        onClick={() => handleDeleteSubscription(s._id)}
                        style={deleteBtnStyle}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead style={{ background: "#f9fafb" }}>
                    <tr>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Phone</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>Plan</th>
                      <th style={thStyle}>Duration</th>
                      <th style={thStyle}>Start Date</th>
                      <th style={thStyle}>End Date</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((s, idx) => (
                      <tr
                        key={s._id}
                        style={{
                          background: idx % 2 === 0 ? "white" : "#f9fafb",
                        }}
                      >
                        <td style={tdStyle}>{s.name}</td>
                        <td style={tdStyle}>{s.phone}</td>
                        <td style={tdStyle}>{s.email || "-"}</td>
                        <td style={tdStyle}>{s.plan}</td>
                        <td style={tdStyle}>{s.durationMonths} months</td>
                        <td style={tdStyle}>
                          {s.startDate
                            ? new Date(s.startDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td style={tdStyle}>
                          {s.endDate
                            ? new Date(s.endDate).toLocaleDateString()
                            : "-"}
                        </td>
                        {/* ⭐ UPDATED: desktop status dropdown */}
                        <td style={tdStyle}>
                          <select
                            value={s.status || "pending"}
                            onChange={(e) =>
                              handleUpdateSubscriptionStatus(
                                s._id,
                                e.target.value
                              )
                            }
                            style={{
                              padding: "6px 8px",
                              borderRadius: 8,
                              border: "1px solid #d1d5db",
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="expired">Expired</option>
                          </select>
                        </td>
                        <td style={tdStyle}>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              onClick={() =>
                                navigator.clipboard?.writeText(s._id)
                              }
                              style={editBtnStyle}
                            >
                              Copy ID
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteSubscription(s._id)
                              }
                              style={deleteBtnStyle}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* pagination */}
                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: "#6b7280",
                    }}
                  >
                    Page <strong>{subPage}</strong> of{" "}
                    <strong>
                      {Math.max(1, Math.ceil(subTotal / subLimit))}
                    </strong>{" "}
                    — <strong>{subTotal}</strong> total
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => goSubPage(1)}
                      disabled={subPage === 1}
                      style={paginationButtonStyle(subPage === 1)}
                    >
                      First
                    </button>
                    <button
                      onClick={() => goSubPage(Math.max(1, subPage - 1))}
                      disabled={subPage === 1}
                      style={paginationButtonStyle(subPage === 1)}
                    >
                      Prev
                    </button>
                    <button
                      onClick={() =>
                        goSubPage(
                          Math.min(
                            Math.ceil(subTotal / subLimit),
                            subPage + 1
                          )
                        )
                      }
                      disabled={subPage >= Math.ceil(subTotal / subLimit)}
                      style={paginationButtonStyle(
                        subPage >= Math.ceil(subTotal / subLimit)
                      )}
                    >
                      Next
                    </button>
                    <button
                      onClick={() =>
                        goSubPage(
                          Math.max(1, Math.ceil(subTotal / subLimit))
                        )
                      }
                      disabled={subPage >= Math.ceil(subTotal / subLimit)}
                      style={paginationButtonStyle(
                        subPage >= Math.ceil(subTotal / subLimit)
                      )}
                    >
                      Last
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Staff / Roles Panel */}
        {showStaffPanel && (
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>
                Internal Staff / Roles
              </h3>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                  }}
                >
                  {loadingStaff
                    ? "Loading..."
                    : `${staffUsers.length} staff members`}
                </div>
                <button
                  type="button"
                  onClick={handleExportStaffExcel}
                  style={exportBtnStyle}
                >
                  Download Excel
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(true)}
                  style={primaryButtonStyle}
                >
                  + Add Role / Staff
                </button>
              </div>
            </div>

            {loadingStaff ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 20,
                  color: "#6b7280",
                }}
              >
                Loading staff...
              </div>
            ) : staffUsers.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 20,
                  color: "#6b7280",
                }}
              >
                No staff / roles found.
              </div>
            ) : isMobile ? (
              <div>{staffUsers.map(renderStaffCard)}</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead style={{ background: "#f9fafb" }}>
                    <tr>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Role</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>Phone</th>
                      <th style={thStyle}>Aadhar</th>
                      <th style={thStyle}>Address</th>
                      <th style={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffUsers.map((u, idx) => (
                      <tr
                        key={u._id}
                        style={{
                          background: idx % 2 === 0 ? "white" : "#f9fafb",
                        }}
                      >
                        <td style={tdStyle}>
                          {u.companyName || u.name || "-"}
                        </td>
                        <td style={tdStyle}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 700,
                              background: `${getRoleColor(u.role)}20`,
                              color: getRoleColor(u.role),
                            }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td style={tdStyle}>{u.email || "-"}</td>
                        <td style={tdStyle}>
                          {u.whatsappPhone || u.officeNumber || "-"}
                        </td>
                        <td style={tdStyle}>{u.aadharNumber || "-"}</td>
                        <td
                          style={{
                            ...tdStyle,
                            maxWidth: 260,
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                        >
                          {u.address || "-"}
                        </td>
                        <td style={tdStyle}>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              onClick={() => openEdit(u)}
                              style={editBtnStyle}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => openDelete(u)}
                              style={deleteBtnStyle}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Enquiries Panel */}
        {showEnquiries && (
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Enquiries</h3>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                  }}
                >
                  {loadingEnquiries
                    ? "Loading..."
                    : `${enquiries.length} enquiries`}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={handleExportEnquiriesExcel}
                    style={exportBtnStyle}
                  >
                    Download Excel
                  </button>
                </div>
              </div>
            </div>

            {loadingEnquiries ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 20,
                  color: "#6b7280",
                }}
              >
                Loading enquiries...
              </div>
            ) : enquiries.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 20,
                  color: "#6b7280",
                }}
              >
                No enquiries found.
              </div>
            ) : isMobile ? (
              <div>{enquiries.map(renderEnquiryCard)}</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead style={{ background: "#f9fafb" }}>
                    <tr>
                      <th style={thStyle}>Company</th>
                      <th style={thStyle}>Contact Person</th>
                      <th style={thStyle}>Contact No.</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>Membership</th>
                      <th style={thStyle}>Company Details</th>
                      <th style={thStyle}>Company Address</th>
                      <th style={thStyle}>Address</th>
                      <th style={thStyle}>Fleet</th>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiries.map((eq, idx) => (
                      <tr
                        key={eq._id}
                        style={{
                          background: idx % 2 === 0 ? "white" : "#f9fafb",
                        }}
                      >
                        <td style={tdStyle}>{eq.companyName}</td>
                        <td style={tdStyle}>{eq.contactPersonName}</td>
                        <td style={tdStyle}>{eq.contactNo}</td>
                        <td style={tdStyle}>{eq.email}</td>
                        <td style={tdStyle}>{eq.membership}</td>
                        <td
                          style={{
                            ...tdStyle,
                            maxWidth: 280,
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                        >
                          {eq.companyDetails}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            maxWidth: 240,
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                        >
                          {eq.companyAddress}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            maxWidth: 240,
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                        >
                          {eq.address}
                        </td>
                        <td style={tdStyle}>{eq.numberOfFleet ?? "-"}</td>
                        <td style={tdStyle}>
                          {eq.createdAt
                            ? new Date(eq.createdAt).toLocaleString()
                            : "-"}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            color: eq.status === "done" ? "#065f46" : "#374151",
                            fontWeight: 700,
                          }}
                        >
                          <select
                            value={eq.status || "pending"}
                            onChange={(e) =>
                              handleChangeEnquiryStatus(eq._id, e.target.value)
                            }
                            style={{
                              padding: "6px 8px",
                              borderRadius: 8,
                              border: "1px solid #d1d5db",
                              fontWeight: 700,
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="done">Done</option>
                          </select>
                        </td>

                        <td style={tdStyle}>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              onClick={() =>
                                navigator.clipboard?.writeText(eq._id)
                              }
                              style={editBtnStyle}
                            >
                              Copy ID
                            </button>
                            <button
                              onClick={() => handleDeleteEnquiry(eq._id)}
                              style={deleteBtnStyle}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users table / pagination (partners) */}
        {activeTab && (
          <>
            <div
              style={{
                background: "white",
                borderRadius: 12,
                boxShadow: "0 4px 6px rgba(0,0,0,0.04)",
                overflow: "hidden",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  padding: 16,
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#1f2937",
                  }}
                >
                  {roleLabel(activeTab)} List
                </h3>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={handleExportUsersExcel}
                    style={exportBtnStyle}
                  >
                    Download Excel
                  </button>
                </div>
              </div>
              {loading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 28,
                    color: "#6b7280",
                  }}
                >
                  Loading users...
                </div>
              ) : users.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 28,
                    color: "#6b7280",
                  }}
                >
                  No users found.
                </div>
              ) : isMobile ? (
                <div style={{ padding: 12 }}>{users.map(renderUserCard)}</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead style={{ background: "#f9fafb" }}>
  <tr>
    <th style={thStyle}>Company</th>
    <th style={thStyle}>State</th>
    <th style={thStyle}>City</th>
    <th style={thStyle}>Area</th>
    <th style={thStyle}>WhatsApp Phone</th>
    <th style={thStyle}>Office No.</th>
    <th style={thStyle}>Role</th>
    <th style={thStyle}>GSTN</th>
    <th style={thStyle}>PAN</th>
    <th style={thStyle}>Aadhar</th>
    <th style={thStyle}>Bank A/c</th>
    <th style={thStyle}>IFSC</th>
    <th style={thStyle}>Cancel Cheque</th>
    <th style={thStyle}>Email</th>
    <th style={thStyle}>About</th>
    <th style={thStyle}>Address</th>

    {/* ⭐ NEW PDF COLUMNS */}
    <th style={thStyle}>Aadhar PDF</th>
    <th style={thStyle}>Bank PDF</th>
    <th style={thStyle}>Certificate PDF</th>

    <th style={thStyle}>Actions</th>
  </tr>
</thead>
                    <tbody>
  {users.map((u, idx) => (
    <tr
      key={u._id}
      style={{
        background: idx % 2 === 0 ? "white" : "#f9fafb",
      }}
    >
      <td style={tdStyle}>{u.companyName || "-"}</td>
      <td style={tdStyle}>{u.state || "-"}</td>
      <td style={tdStyle}>{u.city || "-"}</td>
      <td style={tdStyle}>{u.area || "-"}</td>
      <td style={tdStyle}>{u.whatsappPhone || "-"}</td>
      <td style={tdStyle}>{u.officeNumber || "-"}</td>
      <td style={tdStyle}>
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            background: `${getRoleColor(u.role)}20`,
            color: getRoleColor(u.role),
          }}
        >
          {u.role}
        </span>
      </td>
      <td style={tdStyle}>{u.gstNumber || "-"}</td>
      <td style={tdStyle}>{u.panNumber || "-"}</td>
      <td style={tdStyle}>{u.aadharNumber || "-"}</td>
      <td style={tdStyle}>{u.bankAccountNumber || "-"}</td>
      <td style={tdStyle}>{u.ifscCode || "-"}</td>
      <td style={tdStyle}>{u.cancelCheque || "-"}</td>
      <td style={tdStyle}>{u.email || "-"}</td>

      {/* About */}
      <td style={tdStyle}>{u.aboutInfo || "-"}</td>

      {/* Address */}
      <td
        style={{
          ...tdStyle,
          maxWidth: 260,
          whiteSpace: "normal",
          wordBreak: "break-word",
        }}
      >
        {u.address || "-"}
      </td>

      {/* ⭐ Aadhar PDF */}
      <td style={tdStyle}>
        {(() => {
          const path =
            u.aadharPdfUrl || u.aadharPdf || u.aadharPdfPath || u.aadhar_pdf;
          const url = getPdfUrl(path);
          return url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "underline",
                color: "#2563eb",
                fontWeight: 600,
              }}
            >
              View PDF
            </a>
          ) : (
            <span style={{ color: "#9ca3af" }}>Not uploaded</span>
          );
        })()}
      </td>

      {/* ⭐ Bank PDF */}
      <td style={tdStyle}>
        {(() => {
          const path = u.bankPdfUrl || u.bankPdf || u.bankPdfPath || u.bank_pdf;
          const url = getPdfUrl(path);
          return url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "underline",
                color: "#2563eb",
                fontWeight: 600,
              }}
            >
              View PDF
            </a>
          ) : (
            <span style={{ color: "#9ca3af" }}>Not uploaded</span>
          );
        })()}
      </td>

      {/* ⭐ Certificate PDF */}
      <td style={tdStyle}>
        {(() => {
          const path =
            u.certificatePdfUrl ||
            u.certificatePdf ||
            u.certificatePdfPath ||
            u.certificate_pdf;
          const url = getPdfUrl(path);
          return url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "underline",
                color: "#2563eb",
                fontWeight: 600,
              }}
            >
              View PDF
            </a>
          ) : (
            <span style={{ color: "#9ca3af" }}>Not uploaded</span>
          );
        })()}
      </td>

      {/* Actions */}
      <td style={tdStyle}>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <button onClick={() => openEdit(u)} style={editBtnStyle}>
            Edit
          </button>
          <button onClick={() => openDelete(u)} style={deleteBtnStyle}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>

                  </table>
                </div>
              )}
            </div>

            {/* Pagination (partners) */}
            <div
              style={{
                marginTop: 16,
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                background: "white",
                borderRadius: 12,
                padding: 12,
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  textAlign: isMobile ? "center" : "left",
                }}
              >
                Page <span style={{ fontWeight: 700 }}>{page}</span> of{" "}
                <span style={{ fontWeight: 700 }}>
                  {Math.max(1, Math.ceil(total / limit))}
                </span>{" "}
                — <span style={{ fontWeight: 700 }}>{total}</span> total users
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => goPage(1)}
                  disabled={page === 1}
                  style={paginationButtonStyle(page === 1)}
                >
                  First
                </button>
                <button
                  onClick={() => goPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  style={paginationButtonStyle(page === 1)}
                >
                  Prev
                </button>
                <button
                  onClick={() =>
                    goPage(Math.min(Math.ceil(total / limit), page + 1))
                  }
                  disabled={page >= Math.ceil(total / limit)}
                  style={paginationButtonStyle(
                    page >= Math.ceil(total / limit)
                  )}
                >
                  Next
                </button>
                <button
                  onClick={() => goPage(Math.max(1, Math.ceil(total / limit)))}
                  disabled={page >= Math.ceil(total / limit)}
                  style={paginationButtonStyle(
                    page >= Math.ceil(total / limit)
                  )}
                >
                  Last
                </button>
              </div>
            </div>
          </>
        )}

        {/* Add Partner Modal */}
        {showAddUserModal && (
          <div style={modalBackdrop} role="dialog" aria-modal="true">
            <div style={modalContainer}>
              <div
                style={{
                  padding: 16,
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#1f2937",
                  }}
                >
                  Add New Partner
                </h3>
                <button
                  aria-label="Close add user modal"
                  onClick={() => setShowAddUserModal(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: 20,
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateUser} style={{ padding: 16 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "1fr"
                      : "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 12,
                  }}
                >
                  <input
                    type="text"
                    value={newUser.companyName}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        companyName: e.target.value,
                      })
                    }
                    placeholder="Company Name"
                    required
                    style={inputStyle}
                  />

                  {/* State / City / Area */}
                  <select
                    value={newUser.state}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        state: e.target.value,
                        city: "",
                      })
                    }
                    required
                    style={inputStyle}
                  >
                    <option value="">Select State</option>
                    {STATE_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  <select
                    value={newUser.city}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        city: e.target.value,
                      })
                    }
                    required
                    style={inputStyle}
                    disabled={!newUser.state}
                  >
                    <option value="">
                      {newUser.state ? "Select City" : "Select State first"}
                    </option>
                    {availableUserCities.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={newUser.area}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        area: e.target.value,
                      })
                    }
                    placeholder="Area / Locality"
                    required
                    style={inputStyle}
                  />

                  {/* Address */}
                  <textarea
                    value={newUser.address}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        address: e.target.value,
                      })
                    }
                    placeholder="Full Address"
                    required
                    style={{
                      ...textAreaStyle,
                      gridColumn: "1 / -1",
                    }}
                  />

                  {/* Phones */}
                  <input
                    type="text"
                    value={newUser.whatsappPhone}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        whatsappPhone: e.target.value,
                      })
                    }
                    placeholder="WhatsApp Phone (primary)"
                    required
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={newUser.officeNumber}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        officeNumber: e.target.value,
                      })
                    }
                    placeholder="Office Number (optional)"
                    style={inputStyle}
                  />

                  {/* GST / PAN / Aadhar */}
                  <input
                    type="text"
                    value={newUser.gstNumber}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        gstNumber: e.target.value,
                      })
                    }
                    placeholder="GSTN Number"
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={newUser.panNumber}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        panNumber: e.target.value,
                      })
                    }
                    placeholder="PAN Number"
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={newUser.aadharNumber}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        aadharNumber: e.target.value,
                      })
                    }
                    placeholder="Aadhar Number"
                    style={inputStyle}
                  />

                  {/* Role (partner roles only) */}
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        role: e.target.value,
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="driver">Driver</option>
                    <option value="Bus vendor">Bus Vendor</option>
                    <option value="mechanic">Mechanic</option>
                    <option value="cleaner">Cleaner</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="parcel">Parcel</option>
                    <option value="Dry Cleaner">Dry Cleaner</option>
                  </select>

                  {/* Bank & cheque */}
                  <input
                    type="text"
                    value={newUser.bankAccountNumber}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        bankAccountNumber: e.target.value,
                      })
                    }
                    placeholder="Bank Account Number"
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={newUser.ifscCode}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        ifscCode: e.target.value,
                      })
                    }
                    placeholder="IFSC Code"
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={newUser.cancelCheque}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        cancelCheque: e.target.value,
                      })
                    }
                    placeholder="Cancelled Cheque (URL / Ref)"
                    style={inputStyle}
                  />

                  {/* About */}
                  <textarea
                    value={newUser.aboutInfo}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        aboutInfo: e.target.value,
                      })
                    }
                    placeholder="About / Notes (services, fleet details, etc.)"
                    style={{
                      ...textAreaStyle,
                      gridColumn: "1 / -1",
                    }}
                  />

                  {/* Email / password */}
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        email: e.target.value,
                      })
                    }
                    placeholder="Email (optional)"
                    style={inputStyle}
                  />
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        password: e.target.value,
                      })
                    }
                    placeholder="Password (optional)"
                    style={inputStyle}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  <button type="submit" style={primaryButtonStyle}>
                    Create Partner
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    style={secondaryButtonStyle}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Staff / Role Modal */}
        {showAddStaffModal && (
          <div style={modalBackdrop} role="dialog" aria-modal="true">
            <div style={modalContainer}>
              <div
                style={{
                  padding: 16,
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#1f2937",
                  }}
                >
                  Add Role / Staff User
                </h3>
                <button
                  aria-label="Close add staff modal"
                  onClick={() => setShowAddStaffModal(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: 20,
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateStaff} style={{ padding: 16 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "1fr"
                      : "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 12,
                  }}
                >
                  <input
                    type="text"
                    value={staffForm.name}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, name: e.target.value })
                    }
                    placeholder="Name"
                    required
                    style={inputStyle}
                  />
                  <input
                    type="email"
                    value={staffForm.email}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, email: e.target.value })
                    }
                    placeholder="Email"
                    style={inputStyle}
                  />
                  <input
                    type="password"
                    value={staffForm.password}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, password: e.target.value })
                    }
                    placeholder="Password"
                    required
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={staffForm.phone}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, phone: e.target.value })
                    }
                    placeholder="Mobile Number"
                    required
                    style={inputStyle}
                  />
                  <input
                    type="text"
                    value={staffForm.aadharNumber}
                    onChange={(e) =>
                      setStaffForm({
                        ...staffForm,
                        aadharNumber: e.target.value,
                      })
                    }
                    placeholder="Aadhar Number"
                    style={inputStyle}
                  />
                  <select
                    value={staffForm.role}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, role: e.target.value })
                    }
                    required
                    style={inputStyle}
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="accountant">Accountant</option>
                    <option value="branch-head">Branch Head</option>
                    <option value="sales">Sales</option>
                  </select>

                  <textarea
                    value={staffForm.address}
                    onChange={(e) =>
                      setStaffForm({ ...staffForm, address: e.target.value })
                    }
                    placeholder="Address"
                    style={{
                      ...textAreaStyle,
                      gridColumn: "1 / -1",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  <button type="submit" style={primaryButtonStyle}>
                    Create Staff User
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddStaffModal(false)}
                    style={secondaryButtonStyle}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingUser && (
          <div style={modalBackdrop} role="dialog" aria-modal="true">
            <div style={modalContainer}>
              <div
                style={{
                  padding: 16,
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#1f2937",
                  }}
                >
                  Edit User
                </h3>
                <button
                  aria-label="Close edit modal"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: 20,
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleEditSubmit} style={{ padding: 16 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "1fr"
                      : "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 12,
                  }}
                >
                  <input
                    required
                    value={editingUser.companyName || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        companyName: e.target.value,
                      })
                    }
                    placeholder="Name / Company Name"
                    style={inputStyle}
                  />
                  <select
                    value={editingUser.state || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        state: e.target.value,
                        city: "",
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="">Select State</option>
                    {STATE_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <select
                    value={editingUser.city || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        city: e.target.value,
                      })
                    }
                    style={inputStyle}
                    disabled={!editingUser.state}
                  >
                    <option value="">
                      {editingUser.state ? "Select City" : "Select State first"}
                    </option>
                    {availableEditCities.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct}
                      </option>
                    ))}
                  </select>
                  <input
                    value={editingUser.area || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        area: e.target.value,
                      })
                    }
                    placeholder="Area / Locality"
                    style={inputStyle}
                  />
                  <textarea
                    value={editingUser.address || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        address: e.target.value,
                      })
                    }
                    placeholder="Address"
                    style={{
                      ...textAreaStyle,
                      gridColumn: "1 / -1",
                    }}
                  />
                  <input
                    value={editingUser.whatsappPhone || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        whatsappPhone: e.target.value,
                      })
                    }
                    placeholder="WhatsApp Phone"
                    style={inputStyle}
                  />
                  <input
                    value={editingUser.officeNumber || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        officeNumber: e.target.value,
                      })
                    }
                    placeholder="Office Number"
                    style={inputStyle}
                  />
                  <input
                    value={editingUser.gstNumber || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        gstNumber: e.target.value,
                      })
                    }
                    placeholder="GSTN Number"
                    style={inputStyle}
                  />
                  <input
                    value={editingUser.panNumber || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        panNumber: e.target.value,
                      })
                    }
                    placeholder="PAN Number"
                    style={inputStyle}
                  />
                  <input
                    value={editingUser.aadharNumber || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        aadharNumber: e.target.value,
                      })
                    }
                    placeholder="Aadhar Number"
                    style={inputStyle}
                  />
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        role: e.target.value,
                      })
                    }
                    style={inputStyle}
                  >
                    {/* staff roles */}
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="accountant">Accountant</option>
                    <option value="branch-head">Branch Head</option>
                    <option value="sales">Sales</option>
                    {/* partner roles */}
                    <option value="driver">Driver</option>
                    <option value="Bus vendor">Bus Vendor</option>
                    <option value="mechanic">Mechanic</option>
                    <option value="cleaner">Cleaner</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="parcel">Parcel</option>
                    <option value="Dry Cleaner">Dry Cleaner</option>
                  </select>
                  <input
                    value={editingUser.bankAccountNumber || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        bankAccountNumber: e.target.value,
                      })
                    }
                    placeholder="Bank Account Number"
                    style={inputStyle}
                  />
                  <input
                    value={editingUser.ifscCode || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        ifscCode: e.target.value,
                      })
                    }
                    placeholder="IFSC Code"
                    style={inputStyle}
                  />
                  <input
                    value={editingUser.cancelCheque || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        cancelCheque: e.target.value,
                      })
                    }
                    placeholder="Cancelled Cheque (URL / Ref)"
                    style={inputStyle}
                  />
                  <textarea
                    value={editingUser.aboutInfo || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        aboutInfo: e.target.value,
                      })
                    }
                    placeholder="About / Notes"
                    style={{
                      ...textAreaStyle,
                      gridColumn: "1 / -1",
                    }}
                  />
                  <input
                    value={editingUser.email || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        email: e.target.value,
                      })
                    }
                    placeholder="Email"
                    style={inputStyle}
                  />
                  <input
                    type="password"
                    placeholder="New password (leave blank to keep)"
                    value={editingUser.password || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        password: e.target.value,
                      })
                    }
                    style={{
                      ...inputStyle,
                      gridColumn: "1 / -1",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  <button type="submit" style={primaryButtonStyle}>
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                    }}
                    style={secondaryButtonStyle}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && deletingUser && (
          <div
            style={modalBackdrop}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <div
              style={{
                ...modalContainer,
                maxWidth: isMobile ? "92%" : 480,
                padding: 12,
              }}
            >
              <div
                style={{
                  padding: 12,
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  id="delete-title"
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#1f2937",
                  }}
                >
                  Confirm Delete
                </h3>
                <button
                  aria-label="Close delete modal"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingUser(null);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: 20,
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ padding: 12 }}>
                <p
                  style={{
                    color: "#6b7280",
                    marginBottom: 16,
                  }}
                >
                  Are you sure you want to delete{" "}
                  <span
                    style={{
                      fontWeight: 800,
                      color: "#1f2937",
                    }}
                  >
                    {deletingUser.companyName ||
                      deletingUser.email ||
                      "this user"}
                  </span>{" "}
                  <span style={{ color: "#6b7280" }}>
                    ({deletingUser.role})
                  </span>
                  ?
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: 10,
                  }}
                >
                  <button
                    ref={deleteConfirmRef}
                    onClick={confirmDelete}
                    style={{
                      flex: isMobile ? "none" : 1,
                      padding: "10px 14px",
                      background:
                        "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontWeight: 800,
                    }}
                  >
                    Delete
                  </button>
                  <button
                    ref={deleteCancelRef}
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletingUser(null);
                    }}
                    style={{
                      flex: isMobile ? "none" : 1,
                      padding: "10px 14px",
                      background: "#f3f4f6",
                      color: "#374151",
                      border: "none",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Subscription Modal */}
        {showAddSubscriptionModal && (
          <div style={modalBackdrop} role="dialog" aria-modal="true">
            <div style={modalContainer}>
              <div
                style={{
                  padding: 16,
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#1f2937",
                  }}
                >
                  Add Subscription
                </h3>
                <button
                  aria-label="Close add subscription modal"
                  onClick={() => setShowAddSubscriptionModal(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: 20,
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateSubscription} style={{ padding: 16 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "1fr"
                      : "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 10,
                  }}
                >
                  <input
                    value={subscriptionForm.name}
                    onChange={(e) =>
                      setSubscriptionForm({
                        ...subscriptionForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="Client Name"
                    required
                    style={inputStyle}
                  />
                  <input
                    value={subscriptionForm.phone}
                    onChange={(e) =>
                      setSubscriptionForm({
                        ...subscriptionForm,
                        phone: e.target.value,
                      })
                    }
                    placeholder="Phone"
                    required
                    style={inputStyle}
                  />
                  <input
                    value={subscriptionForm.email}
                    onChange={(e) =>
                      setSubscriptionForm({
                        ...subscriptionForm,
                        email: e.target.value,
                      })
                    }
                    placeholder="Email (optional)"
                    style={inputStyle}
                  />

                  <select
                    value={subscriptionForm.plan}
                    onChange={(e) =>
                      setSubscriptionForm({
                        ...subscriptionForm,
                        plan: e.target.value,
                      })
                    }
                    style={inputStyle}
                  >
                    {subscriptionPlans.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  <select
                    value={subscriptionForm.durationMonths}
                    onChange={(e) =>
                      setSubscriptionForm({
                        ...subscriptionForm,
                        durationMonths: parseInt(e.target.value, 10),
                      })
                    }
                    style={inputStyle}
                  >
                    {durationOptions.map((d) => (
                      <option key={d} value={d}>
                        {d} months
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={subscriptionForm.startDate}
                    onChange={(e) =>
                      setSubscriptionForm({
                        ...subscriptionForm,
                        startDate: e.target.value,
                      })
                    }
                    placeholder="Start Date"
                    required
                    style={inputStyle}
                  />

                  {/* endDate auto */}
                  <input
                    type="date"
                    value={subscriptionForm.endDate || ""}
                    readOnly
                    placeholder="End Date (auto)"
                    style={{
                      ...inputStyle,
                      background: "#f8fafc",
                    }}
                  />

                  <input
                    value={subscriptionForm.notes}
                    onChange={(e) =>
                      setSubscriptionForm({
                        ...subscriptionForm,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Notes (optional)"
                    style={{
                      ...inputStyle,
                      gridColumn: "1 / -1",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  <button type="submit" style={primaryButtonStyle}>
                    Create Subscription
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubscriptionForm({
                        name: "",
                        phone: "",
                        email: "",
                        plan: "Gold",
                        durationMonths: 3,
                        startDate: "",
                        endDate: "",
                        notes: "",
                      });
                      setShowAddSubscriptionModal(false);
                    }}
                    style={secondaryButtonStyle}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const inputStyle = {
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  outline: "none",
  fontSize: 14,
};
const textAreaStyle = {
  ...inputStyle,
  minHeight: 60,
  resize: "vertical",
};
const thStyle = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 700,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};
const tdStyle = {
  padding: "12px 16px",
  fontSize: 14,
  color: "#374151",
};
const paginationButtonStyle = (disabled) => ({
  padding: "8px 12px",
  background: "#f3f4f6",
  color: disabled ? "#9ca3af" : "#374151",
  border: "none",
  borderRadius: 8,
  cursor: disabled ? "not-allowed" : "pointer",
  fontWeight: 700,
  opacity: disabled ? 0.6 : 1,
});
const modalBackdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: 16,
};
const modalContainer = {
  background: "white",
  borderRadius: 12,
  maxWidth: 800,
  width: "100%",
  maxHeight: "92vh",
  overflowY: "auto",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
};
const primaryButtonStyle = {
  padding: "10px 14px",
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  color: "white",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 800,
};
const secondaryButtonStyle = {
  padding: "10px 14px",
  background: "#e5e7eb",
  color: "#374151",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
};
const editBtnStyle = {
  padding: "6px 10px",
  background: "#dbeafe",
  color: "#1e40af",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
};
const deleteBtnStyle = {
  padding: "6px 10px",
  background: "#fee2e2",
  color: "#991b1b",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
};
const exportBtnStyle = {
  padding: "6px 10px",
  background: "#e0f2fe",
  color: "#0369a1",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
};

export default AdminDashboard;
