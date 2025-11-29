import React, { useEffect, useState } from "react";
import api from "../api/apiClient";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

// Tabs / filtering roles
const ROLES = [
  "all",
  "driver",
  "Bus vendor",
  "mechanic",
  "cleaner",
  "admin",
  "restaurant",
  "parcel",
  "Dry Cleaner",
];

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("driver");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

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

  // responsive
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

  // fetch users
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

  // fetch enquiries (view only)
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

  // Subscriptions list (view only)
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

  const goSubPage = (p) => {
    setSubPage(p);
    fetchSubscriptions(p, subSearch);
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

  // init
  useEffect(() => {
    fetchStats();
    fetchUsers(activeTab, 1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchUsers(activeTab, page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page]);

  const changeTab = (r) => {
    setActiveTab(r === "all" ? "all" : r);
    setPage(1);
    setSearch("");
    setShowEnquiries(false);
    setShowSubscriptionsPanel(false);
  };

  const toggleEnquiries = () => {
    const next = !showEnquiries;
    setShowEnquiries(next);
    setShowSubscriptionsPanel(false);
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
    if (next) {
      setActiveTab(null);
      setSubPage(1);
      setSubSearch("");
      fetchSubscriptions(1, "");
    } else {
      setActiveTab("driver");
    }
  };

  const roleLabel = (r) =>
    r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1);

  const getRoleColor = (role) => {
    const colors = {
      driver: "#3b82f6",
      "Bus vendor": "#a855f7",
      mechanic: "#f97316",
      cleaner: "#10b981",
      admin: "#ef4444",
      restaurant: "#22c55e",
      parcel: "#0ea5e9",
      "Dry Cleaner": "#14b8a6",
    };
    return colors[role] || "#6b7280";
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

  // Users export
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
  // Cards render helpers (view only)
  // ----------------------------

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

          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: eq.status === "done" ? "#065f46" : "#92400e",
              fontWeight: 700,
            }}
          >
            Status: {eq.status?.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );

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
      </div>
    </div>
  );

  const renderSubscriptionCard = (s) => (
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
      <div style={{ fontWeight: 800, color: "#111827", fontSize: 15 }}>
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
        {s.startDate ? new Date(s.startDate).toLocaleDateString() : "-"} →{" "}
        {s.endDate ? new Date(s.endDate).toLocaleDateString() : "-"}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 12,
          color: "#6b7280",
        }}
      >
        Status: {s.status}
      </div>
    </div>
  );

  // --- SEARCH / CONTROL STYLES (same as admin, minus add buttons) ---
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
            Manager Dashboard
          </h1>
          <p
            style={{
              color: "#6b7280",
              fontSize: isMobile ? 13 : 14,
            }}
          >
            View users, enquiries and subscriptions (read-only access)
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

              <button onClick={toggleEnquiries} style={enquiryBtnStyle}>
                {showEnquiries ? "Hide Enquiries" : "Show Enquiries"}
              </button>

              <button
                onClick={toggleSubscriptions}
                style={subscriptionBtnStyle}
              >
                {showSubscriptionsPanel ? "Hide Subscriptions" : "Subscriptions"}
              </button>
            </div>
          </div>
        </div>

        {/* Subscriptions Panel (view only) */}
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
              <div>{subscriptions.map(renderSubscriptionCard)}</div>
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
                        <td style={tdStyle}>{s.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

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
                        goSubPage(Math.max(1, Math.ceil(subTotal / subLimit)))
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

        {/* Enquiries Panel (view only) */}
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
                            color:
                              eq.status === "done" ? "#065f46" : "#92400e",
                            fontWeight: 700,
                          }}
                        >
                          {eq.status?.toUpperCase()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users table / pagination (view only) */}
        {activeTab && (
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
                        <td
                          style={{
                            ...tdStyle,
                            maxWidth: 260,
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                        >
                          {u.aboutInfo || "-"}
                        </td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users pagination */}
        {activeTab && (
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
                style={paginationButtonStyle(page >= Math.ceil(total / limit))}
              >
                Next
              </button>
              <button
                onClick={() =>
                  goPage(Math.max(1, Math.ceil(total / limit)))
                }
                disabled={page >= Math.ceil(total / limit)}
                style={paginationButtonStyle(page >= Math.ceil(total / limit))}
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// shared styles (same as AdminDashboard)
const inputStyle = {
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  outline: "none",
  fontSize: 14,
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

export default ManagerDashboard;
