// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import api from "../api/apiClient";
import { useNavigate, useSearchParams } from "react-router-dom";

const ROLE_OPTIONS = [
  "driver",
  "vendor",
  "mechanic",
  "cleaner",
  "restaurant",
  "parcel",
];

// Accept both direct role values and service slugs
const normalizeRoleFromParam = (raw) => {
  const v = (raw || "").toLowerCase();

  const aliasMap = {
    // direct roles
    driver: "driver",
    cleaner: "cleaner",
    mechanic: "mechanic",
    vendor: "vendor",
    restaurant: "restaurant",
    parcel: "parcel",

    // slugs from service titles
    "professional-drivers": "driver",
    "bus-cleaners": "cleaner",
    "mechanic-support": "mechanic",
    "replacement-bus": "vendor",
    "emergency-services": "vendor",
    "parcel-delivery": "parcel",
    "parcel-vendor": "parcel",
    "parcel-vendors": "parcel",
    "restaurant-services": "restaurant",
    "restaurant-vendors": "restaurant",
  };

  const resolved = aliasMap[v];
  return ROLE_OPTIONS.includes(resolved) ? resolved : "driver";
};

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const incomingParam = searchParams.get("service");
  const initialRole = normalizeRoleFromParam(incomingParam);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    role: initialRole,
    AddharNo: "",
    address: "",
  });

  useEffect(() => {
    const updatedRole = normalizeRoleFromParam(incomingParam);
    setForm((prev) =>
      prev.role === updatedRole ? prev : { ...prev, role: updatedRole }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingParam]);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      const res = await api.post("/api/auth/register", form);
      const successText = res?.data?.message || "Registered successfully!";
      setMsg({ type: "success", text: successText });
      setShowSuccessPopup(true);

      // reset, but keep role from URL
      setForm({
        name: "",
        phone: "",
        email: "",
        role: initialRole,
        AddharNo: "",
        address: "",
      });

      setTimeout(() => setShowSuccessPopup(false), 2500);
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.response?.data?.message || "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    pageContainer: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    formWrapper: {
      background: "#fff",
      borderRadius: "20px",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
      padding: "40px",
      maxWidth: "500px",
      width: "100%",
      animation: "slideIn 0.5s ease-out",
    },
    heading: {
      textAlign: "center",
      color: "#333",
      fontSize: "28px",
      fontWeight: "700",
      marginBottom: "10px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
    subtitle: {
      textAlign: "center",
      color: "#666",
      fontSize: "14px",
      marginBottom: "30px",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    label: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      fontSize: "14px",
      fontWeight: "600",
      color: "#333",
    },
    input: {
      padding: "12px 16px",
      border: "2px solid #e0e0e0",
      borderRadius: "10px",
      fontSize: "15px",
      transition: "all 0.3s ease",
      outline: "none",
      backgroundColor: "#f9f9f9",
    },
    inputFocus: {
      border: "2px solid #667eea",
      backgroundColor: "#fff",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)",
    },
    select: {
      padding: "12px 16px",
      border: "2px solid #e0e0e0",
      borderRadius: "10px",
      fontSize: "15px",
      transition: "all 0.3s ease",
      outline: "none",
      backgroundColor: "#f9f9f9",
      cursor: "pointer",
    },
    textarea: {
      padding: "12px 16px",
      border: "2px solid #e0e0e0",
      borderRadius: "10px",
      fontSize: "15px",
      transition: "all 0.3s ease",
      outline: "none",
      backgroundColor: "#f9f9f9",
      minHeight: "80px",
      resize: "vertical",
      fontFamily: "inherit",
    },
    button: {
      padding: "14px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.3s ease",
      marginTop: "10px",
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
    buttonHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 20px rgba(102, 126, 234, 0.4)",
    },
    buttonDisabled: {
      opacity: "0.6",
      cursor: "not-allowed",
      transform: "none",
    },
    message: {
      padding: "12px 16px",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: "500",
      textAlign: "center",
      marginTop: "10px",
      animation: "fadeIn 0.3s ease",
    },
    messageSuccess: {
      background: "#d4edda",
      color: "#155724",
      border: "1px solid #c3e6cb",
    },
    messageError: {
      background: "#f8d7da",
      color: "#721c24",
      border: "1px solid #f5c6cb",
    },
    icon: {
      fontSize: "12px",
      color: "#999",
      fontStyle: "italic",
    },
    popupOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.45)",
      zIndex: 9999,
    },
    popupCard: {
      background: "#fff",
      padding: "24px 28px",
      borderRadius: "12px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      maxWidth: "420px",
      width: "90%",
      textAlign: "center",
    },
    popupTitle: {
      fontSize: "18px",
      fontWeight: 700,
      marginBottom: "8px",
    },
    popupText: {
      fontSize: "14px",
      color: "#444",
      marginBottom: "12px",
    },
    popupClose: {
      padding: "10px 14px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#fff",
      fontWeight: 700,
    },
  };

  const [focusedField, setFocusedField] = useState(null);
  const [buttonHover, setButtonHover] = useState(false);

  return (
    <div style={styles.pageContainer}>
      <style>
        {`
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @media (max-width: 600px) {
            .form-wrapper { padding: 25px !important; }
            .heading { font-size: 24px !important; }
          }
        `}
      </style>

      <div style={styles.formWrapper} className="form-wrapper">
        <h2 style={styles.heading} className="heading">
          User Registration
        </h2>
        <p style={styles.subtitle}>
          Join PuneBus and start your journey with us
        </p>

        <form onSubmit={submit} style={styles.form}>
          <label style={styles.label}>
            Name *
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              style={{
                ...styles.input,
                ...(focusedField === "name" ? styles.inputFocus : {}),
              }}
              placeholder="Enter your full name"
              required
            />
          </label>

          <label style={styles.label}>
            Phone Number *
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              onFocus={() => setFocusedField("phone")}
              onBlur={() => setFocusedField(null)}
              style={{
                ...styles.input,
                ...(focusedField === "phone" ? styles.inputFocus : {}),
              }}
              placeholder="Enter your phone number"
              required
            />
          </label>

          <label style={styles.label}>
            Email <span style={styles.icon}>(optional)</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              style={{
                ...styles.input,
                ...(focusedField === "email" ? styles.inputFocus : {}),
              }}
              placeholder="your.email@example.com"
            />
          </label>

          <label style={styles.label}>
            Role *
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              onFocus={() => setFocusedField("role")}
              onBlur={() => setFocusedField(null)}
              style={{
                ...styles.select,
                ...(focusedField === "role" ? styles.inputFocus : {}),
              }}
              required
            >
              <option value="driver">🚍 Driver</option>
              <option value="vendor">🚌 Bus Vendor</option>
              <option value="mechanic">🔧 Mechanic</option>
              <option value="cleaner">🧹 Cleaner</option>
              <option value="restaurant">🍽 Restaurant</option>
              <option value="parcel">📦 Parcel Vendor</option>
            </select>
          </label>

          <label style={styles.label}>
            AddharNo <span style={styles.icon}>(Verification)</span>
            <input
              name="AddharNo"
              value={form.AddharNo}
              onChange={handleChange}
              onFocus={() => setFocusedField("AddharNo")}
              onBlur={() => setFocusedField(null)}
              style={{
                ...styles.input,
                ...(focusedField === "AddharNo" ? styles.inputFocus : {}),
              }}
              placeholder="e.g., 8568-1241-7456"
            />
          </label>

          <label style={styles.label}>
            Address <span style={styles.icon}>(optional)</span>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              onFocus={() => setFocusedField("address")}
              onBlur={() => setFocusedField(null)}
              style={{
                ...styles.textarea,
                ...(focusedField === "address" ? styles.inputFocus : {}),
              }}
              placeholder="Enter your complete address"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => setButtonHover(true)}
            onMouseLeave={() => setButtonHover(false)}
            style={{
              ...styles.button,
              ...(buttonHover && !loading ? styles.buttonHover : {}),
              ...(loading ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? "⏳ Registering..." : "✓ Register Now"}
          </button>

          {msg && (
            <div
              style={{
                ...styles.message,
                ...(msg.type === "success"
                  ? styles.messageSuccess
                  : styles.messageError),
              }}
            >
              {msg.type === "success" ? "✓ " : "✗ "}
              {msg.text}
            </div>
          )}
        </form>
      </div>

      {/* Success popup modal */}
      {showSuccessPopup && (
        <div style={styles.popupOverlay} role="dialog" aria-modal="true">
          <div style={styles.popupCard}>
            <div style={styles.popupTitle}>Registration Successful</div>
            <div style={styles.popupText}>
              {msg?.text || "You have been registered successfully."}
            </div>
            <button
              style={styles.popupClose}
              onClick={() => setShowSuccessPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
