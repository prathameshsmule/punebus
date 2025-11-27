// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import api from "../api/apiClient";
import { useNavigate, useSearchParams } from "react-router-dom";

const ROLE_OPTIONS = [
  "driver",
  "Bus vendor",
  "mechanic",
  "cleaner",
  "admin",
  "restaurant",
  "parcel",
  "Dry Cleaner",
];

// Accept both direct role values and service slugs
const normalizeRoleFromParam = (raw) => {
  const v = (raw || "").toLowerCase();

  const aliasMap = {
    // direct roles
    driver: "driver",
    "bus vendor": "Bus vendor",
    vendor: "Bus vendor",
    mechanic: "mechanic",
    cleaner: "cleaner",
    admin: "admin",
    restaurant: "restaurant",
    parcel: "parcel",
    "dry cleaner": "Dry Cleaner",
    "dry-cleaner": "Dry Cleaner",

    // slugs from service titles (old ones still supported)
    "professional-drivers": "driver",
    "bus-cleaners": "cleaner",
    "mechanic-support": "mechanic",
    "replacement-bus": "Bus vendor",
    "emergency-services": "Bus vendor",
    "parcel-delivery": "parcel",
    "parcel-vendor": "parcel",
    "parcel-vendors": "parcel",
    "restaurant-services": "restaurant",
    "restaurant-vendors": "restaurant",
  };

  const resolved = aliasMap[v];
  return ROLE_OPTIONS.includes(resolved) ? resolved : "driver";
};

// Simple example data – you can expand this as needed
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

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const incomingParam = searchParams.get("service");
  const initialRole = normalizeRoleFromParam(incomingParam);

  const [form, setForm] = useState({
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
    role: initialRole,
    aboutInfo: "",
    bankAccountNumber: "",
    ifscCode: "",
    cancelCheque: "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    // When state changes, also reset city
    if (name === "state") {
      setForm((prev) => ({
        ...prev,
        state: value,
        city: "",
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      // Adjust this path if your backend is prefixed with /api
      // const res = await api.post("/api/auth/register", form);
      const res = await api.post("/auth/register", form);
      const successText = res?.data?.message || "Registered successfully!";
      setMsg({ type: "success", text: successText });
      setShowSuccessPopup(true);

      // Reset, but keep role from URL
      setForm({
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
        role: initialRole,
        aboutInfo: "",
        bankAccountNumber: "",
        ifscCode: "",
        cancelCheque: "",
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
      maxWidth: "600px",
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
      gap: "18px",
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
      padding: "10px 14px",
      border: "2px solid #e0e0e0",
      borderRadius: "10px",
      fontSize: "14px",
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
      padding: "10px 14px",
      border: "2px solid #e0e0e0",
      borderRadius: "10px",
      fontSize: "14px",
      transition: "all 0.3s ease",
      outline: "none",
      backgroundColor: "#f9f9f9",
      cursor: "pointer",
    },
    textarea: {
      padding: "10px 14px",
      border: "2px solid #e0e0e0",
      borderRadius: "10px",
      fontSize: "14px",
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
    fieldRow: {
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
    },
    fieldCol: {
      flex: 1,
      minWidth: "180px",
    },
  };

  const [focusedField, setFocusedField] = useState(null);
  const [buttonHover, setButtonHover] = useState(false);

  const availableCities =
    CITY_OPTIONS_BY_STATE[form.state] || CITY_OPTIONS_BY_STATE["Other"];

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
          Partner Registration
        </h2>
        <p style={styles.subtitle}>
          Register your company with PuneBus and start working with us.
        </p>

        <form onSubmit={submit} style={styles.form}>
          {/* Company name */}
          <label style={styles.label}>
            Company Name *
            <input
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              onFocus={() => setFocusedField("companyName")}
              onBlur={() => setFocusedField(null)}
              style={{
                ...styles.input,
                ...(focusedField === "companyName" ? styles.inputFocus : {}),
              }}
              placeholder="Enter your company name"
              required
            />
          </label>

          {/* Address & Area */}
          <label style={styles.label}>
            Address *
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
              placeholder="Flat / Building / Street / Landmark"
              required
            />
          </label>

          <div style={styles.fieldRow}>
            <div style={styles.fieldCol}>
              <label style={styles.label}>
                State *
                <select
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("state")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...styles.select,
                    ...(focusedField === "state" ? styles.inputFocus : {}),
                  }}
                  required
                >
                  <option value="">Select state</option>
                  {STATE_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={styles.fieldCol}>
              <label style={styles.label}>
                City *
                <select
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("city")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...styles.select,
                    ...(focusedField === "city" ? styles.inputFocus : {}),
                  }}
                  required
                  disabled={!form.state}
                >
                  <option value="">
                    {form.state ? "Select city" : "Select state first"}
                  </option>
                  {availableCities.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <label style={styles.label}>
            Area / Locality *
            <input
              name="area"
              value={form.area}
              onChange={handleChange}
              onFocus={() => setFocusedField("area")}
              onBlur={() => setFocusedField(null)}
              style={{
                ...styles.input,
                ...(focusedField === "area" ? styles.inputFocus : {}),
              }}
              placeholder="e.g., Kothrud, Hinjewadi"
              required
            />
          </label>

          {/* Contact numbers */}
          <div style={styles.fieldRow}>
            <div style={styles.fieldCol}>
              <label style={styles.label}>
                Phone Number (WhatsApp) *
                <input
                  name="whatsappPhone"
                  type="tel"
                  value={form.whatsappPhone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("whatsappPhone")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...styles.input,
                    ...(focusedField === "whatsappPhone"
                      ? styles.inputFocus
                      : {}),
                  }}
                  placeholder="WhatsApp number"
                  required
                />
              </label>
            </div>

            <div style={styles.fieldCol}>
              <label style={styles.label}>
                Office Number
                <input
                  name="officeNumber"
                  type="tel"
                  value={form.officeNumber}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("officeNumber")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...styles.input,
                    ...(focusedField === "officeNumber"
                      ? styles.inputFocus
                      : {}),
                  }}
                  placeholder="Landline / office contact"
                />
              </label>
            </div>
          </div>

          {/* GST / PAN / Aadhar */}
          <div style={styles.fieldRow}>
            <div style={styles.fieldCol}>
              <label style={styles.label}>
                GSTN Number
                <input
                  name="gstNumber"
                  value={form.gstNumber}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("gstNumber")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...styles.input,
                    ...(focusedField === "gstNumber" ? styles.inputFocus : {}),
                  }}
                  placeholder="e.g., 27ABCDE1234F1Z5"
                />
              </label>
            </div>

            <div style={styles.fieldCol}>
              <label style={styles.label}>
                PAN Number
                <input
                  name="panNumber"
                  value={form.panNumber}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("panNumber")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...styles.input,
                    ...(focusedField === "panNumber" ? styles.inputFocus : {}),
                  }}
                  placeholder="e.g., ABCDE1234F"
                />
              </label>
            </div>
          </div>

          <label style={styles.label}>
            Aadhar Number
            <input
              name="aadharNumber"
              value={form.aadharNumber}
              onChange={handleChange}
              onFocus={() => setFocusedField("aadharNumber")}
              onBlur={() => setFocusedField(null)}
              style={{
                ...styles.input,
                ...(focusedField === "aadharNumber" ? styles.inputFocus : {}),
              }}
              placeholder="e.g., 8568-1241-7456"
            />
          </label>

          {/* Role */}
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
              <option value="">Select role</option>
              <option value="driver">🚍 Driver</option>
              <option value="Bus vendor">🚌 Bus Vendor</option>
              <option value="mechanic">🔧 Mechanic</option>
              <option value="cleaner">🧹 Cleaner</option>
              <option value="restaurant">🍽 Restaurant</option>
              <option value="parcel">📦 Parcel Vendor</option>
              <option value="Dry Cleaner">👕 Dry Cleaner</option>
              <option value="admin">👤 Admin</option>
            </select>
          </label>

          {/* About */}
          <label style={styles.label}>
            About / Additional Info
            <textarea
              name="aboutInfo"
              value={form.aboutInfo}
              onChange={handleChange}
              onFocus={() => setFocusedField("aboutInfo")}
              onBlur={() => setFocusedField(null)}
              style={{
                ...styles.textarea,
                ...(focusedField === "aboutInfo" ? styles.inputFocus : {}),
              }}
              placeholder="Briefly describe your services, experience, fleet details, etc."
            />
          </label>

          {/* Bank details */}
          <div style={styles.fieldRow}>
            <div style={styles.fieldCol}>
              <label style={styles.label}>
                Bank Account Number
                <input
                  name="bankAccountNumber"
                  value={form.bankAccountNumber}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("bankAccountNumber")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...styles.input,
                    ...(focusedField === "bankAccountNumber"
                      ? styles.inputFocus
                      : {}),
                  }}
                  placeholder="Enter account number"
                />
              </label>
            </div>

            <div style={styles.fieldCol}>
              <label style={styles.label}>
                IFSC Code
                <input
                  name="ifscCode"
                  value={form.ifscCode}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("ifscCode")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...styles.input,
                    ...(focusedField === "ifscCode" ? styles.inputFocus : {}),
                  }}
                  placeholder="e.g., HDFC0001234"
                />
              </label>
            </div>
          </div>

          <label style={styles.label}>
            Cancelled Cheque (Reference / URL)
            <input
              name="cancelCheque"
              value={form.cancelCheque}
              onChange={handleChange}
              onFocus={() => setFocusedField("cancelCheque")}
              onBlur={() => setFocusedField(null)}
              style={{
                ...styles.input,
                ...(focusedField === "cancelCheque" ? styles.inputFocus : {}),
              }}
              placeholder="Paste document URL or reference"
            />
            <span style={styles.icon}>
              (You can later upgrade this to actual file upload with Multer)
            </span>
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
