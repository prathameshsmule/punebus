// src/pages/SalesDashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../api/apiClient";

const SalesDashboard = () => {
  // current logged-in staff (stored in localStorage as "admin" from AdminLogin)
  const [currentUser, setCurrentUser] = useState(null);

  // create-subscription form
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

  // list / history
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // simple filters for history
  const [statusFilter, setStatusFilter] = useState("all"); // all | pending | active
  const [search, setSearch] = useState("");

  // read logged-in staff user
  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse admin from localStorage", e);
    }
  }, []);

  // helper to compute endDate (same logic as AdminDashboard)
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

  // update endDate auto when startDate or duration changes
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

  // fetch subscriptions created by this sales user
 const fetchSubscriptions = async () => {
  if (!currentUser) return;
  setLoading(true);
  setMsg(null);
  try {
    const token = localStorage.getItem("token");

    // abhi sirf search bhej rahe hain, createdBy nahi
    const qp = new URLSearchParams({
      search: search || "",
    });

    const res = await api.get(`/admin/subscriptions?${qp.toString()}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    // jo backend deta hai use hi directly use karo
    const list = res?.data?.subscriptions || [];
    setSubscriptions(list);
  } catch (err) {
    console.error("fetchSubscriptions error:", err);
    setMsg({
      type: "error",
      text: err?.response?.data?.message || "Failed to load subscriptions",
    });
    setSubscriptions([]);
  } finally {
    setLoading(false);
  }
};


  // initial load (and when currentUser available)
  useEffect(() => {
    if (currentUser) {
      fetchSubscriptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // handle create subscription (always pending, sales cannot change status)
  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    setMsg(null);

    const { name, phone, durationMonths, startDate } = subscriptionForm;
    if (!name || !phone || !durationMonths || !startDate) {
      setMsg({
        type: "error",
        text: "Name, phone, duration and start date are required",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const payload = {
        ...subscriptionForm,
        durationMonths: parseInt(subscriptionForm.durationMonths, 10),
        // sales cannot activate; status always pending from frontend
        status: "pending",
        // meta so admin can see who created it
        createdBy: currentUser?._id,
        createdByEmail: currentUser?.email,
        createdByRole: currentUser?.role,
      };

      const res = await api.post("/admin/subscription", payload, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      setMsg({
        type: "success",
        text: res?.data?.message || "Subscription created (pending approval)",
      });

      // reset form but keep default values
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

      // refresh history
      fetchSubscriptions();
    } catch (err) {
      console.error("create subscription err:", err);
      setMsg({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Failed to create subscription, please try again",
      });
    }
  };

  const filteredSubscriptions = subscriptions.filter((s) => {
    let okStatus = true;
    if (statusFilter === "pending") okStatus = s.status === "pending";
    if (statusFilter === "active") okStatus = s.status === "active";
    // (optional) more statuses later

    let okSearch = true;
    if (search) {
      const q = search.toLowerCase();
      okSearch =
        (s.name || "").toLowerCase().includes(q) ||
        (s.phone || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q);
    }

    return okStatus && okSearch;
  });

  const isMobile =
    typeof window !== "undefined" ? window.innerWidth <= 768 : false;

  // badge color by status
  const statusBadgeStyle = (status) => {
    let bg = "#e5e7eb";
    let color = "#374151";
    if (status === "pending") {
      bg = "#fef3c7";
      color = "#92400e";
    } else if (status === "active") {
      bg = "#dcfce7";
      color = "#166534";
    } else if (status === "expired") {
      bg = "#fee2e2";
      color = "#991b1b";
    }
    return {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      background: bg,
      color,
    };
  };

  if (!currentUser) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #ddd6fe 100%)",
        }}
      >
        <div
          style={{
            background: "white",
            padding: 24,
            borderRadius: 16,
            boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
            maxWidth: 420,
            textAlign: "center",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 800,
              marginBottom: 8,
              color: "#1f2937",
            }}
          >
            Sales Dashboard
          </h2>
          <p style={{ color: "#6b7280", marginBottom: 0 }}>
            Please login from the admin portal (Sales account) to view this
            page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #ddd6fe 100%)",
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
            Sales Dashboard
          </h1>
          <p
            style={{
              color: "#6b7280",
              fontSize: isMobile ? 13 : 14,
            }}
          >
            Create new subscriptions for clients. All subscriptions stay{" "}
            <strong>Pending</strong> until approved by Admin.
          </p>
          <p
            style={{
              color: "#9ca3af",
              fontSize: 12,
              marginTop: 4,
            }}
          >
            Logged in as: <strong>{currentUser.email}</strong> (
            {currentUser.role || "sales"})
          </p>
        </div>

        {/* Message */}
        {msg && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 10,
              background:
                msg.type === "success" ? "#ecfdf3" : "rgba(254, 242, 242, 1)",
              color: msg.type === "success" ? "#166534" : "#991b1b",
              border:
                msg.type === "success"
                  ? "1px solid #bbf7d0"
                  : "1px solid #fecaca",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {msg.text}
          </div>
        )}

        {/* Create subscription card */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 6px rgba(0,0,0,0.04)",
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
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#1f2937",
              }}
            >
              Add New Subscription
            </h3>
            <span
              style={{
                fontSize: 12,
                color: "#6b7280",
              }}
            >
              Status will be <strong>Pending</strong> until Admin activates.
            </span>
          </div>

          <form onSubmit={handleCreateSubscription}>
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
                value={subscriptionForm.name}
                onChange={(e) =>
                  setSubscriptionForm({
                    ...subscriptionForm,
                    name: e.target.value,
                  })
                }
                placeholder="Client name"
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
                placeholder="Phone number"
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
                required
                style={inputStyle}
              />
              <input
                type="date"
                readOnly
                value={subscriptionForm.endDate || ""}
                style={{
                  ...inputStyle,
                  background: "#f9fafb",
                }}
                placeholder="End date (auto)"
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
                marginTop: 12,
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: 10,
              }}
            >
              <button type="submit" style={primaryButtonStyle}>
                {loading ? "Saving..." : "Create Subscription"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setSubscriptionForm({
                    name: "",
                    phone: "",
                    email: "",
                    plan: "Gold",
                    durationMonths: 3,
                    startDate: "",
                    endDate: "",
                    notes: "",
                  })
                }
                style={secondaryButtonStyle}
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>

        {/* History card */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 16,
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 6px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: isMobile ? "flex-start" : "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#1f2937",
                  marginBottom: 4,
                }}
              >
                Your Subscriptions History
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                }}
              >
                You can only <strong>view</strong> these records. Activation is
                done by Admin.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={inputStyle}
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending only</option>
                <option value="active">Active only</option>
              </select>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchSubscriptions();
                }}
                style={{ display: "flex", gap: 8 }}
              >
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name / phone / email"
                  style={inputStyle}
                />
                <button type="submit" style={smallButtonStyle}>
                  Search
                </button>
              </form>
              <button
                type="button"
                onClick={fetchSubscriptions}
                style={smallButtonStyle}
              >
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: 24,
                color: "#6b7280",
              }}
            >
              Loading subscriptions...
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 24,
                color: "#6b7280",
              }}
            >
              No subscriptions found.
            </div>
          ) : isMobile ? (
            <div>
              {filteredSubscriptions.map((s) => (
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
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <div>
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
                          marginTop: 4,
                          fontSize: 13,
                          color: "#374151",
                        }}
                      >
                        {s.phone}
                      </div>
                      {s.email && (
                        <div
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            marginTop: 2,
                          }}
                        >
                          {s.email}
                        </div>
                      )}
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
                          marginTop: 4,
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
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={statusBadgeStyle(s.status || "pending")}>
                        {s.status || "pending"}
                      </span>
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 11,
                          color: "#9ca3af",
                        }}
                      >
                        ID: {s._id?.slice(-6)}
                      </div>
                    </div>
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
                    <th style={thStyle}>Start</th>
                    <th style={thStyle}>End</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((s, idx) => (
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
                      <td style={tdStyle}>
                        <span style={statusBadgeStyle(s.status || "pending")}>
                          {s.status || "pending"}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, maxWidth: 240 }}>
                        {s.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// basic shared styles (similar to AdminDashboard)
const inputStyle = {
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  outline: "none",
  fontSize: 14,
};

const thStyle = {
  padding: "10px 14px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 700,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};

const tdStyle = {
  padding: "10px 14px",
  fontSize: 14,
  color: "#374151",
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

const smallButtonStyle = {
  padding: "8px 10px",
  background: "#1f2937",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
};

export default SalesDashboard;

