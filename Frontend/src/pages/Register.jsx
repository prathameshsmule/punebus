// src/pages/Register.jsx
import React, { useState } from "react";
import api from "../api/apiClient";

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
    role: "driver",
    aboutInfo: "",
    bankAccountNumber: "",
    ifscCode: "",
    cancelCheque: "",
    email: "",
    password: "",
    // files
    aadharPdf: null,
    bankPdf: null,
    certificatePdf: null,
  });

  const [submitting, setSubmitting] = useState(false);

  const availableCities =
    CITY_OPTIONS_BY_STATE[form.state] || CITY_OPTIONS_BY_STATE["Other"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files?.[0] || null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName || !form.address || !form.role) {
      alert("Company name, address aur role required hai.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();

      // text fields
      fd.append("companyName", form.companyName);
      fd.append("address", form.address);
      fd.append("state", form.state);
      fd.append("city", form.city);
      fd.append("area", form.area);
      fd.append("whatsappPhone", form.whatsappPhone);
      fd.append("officeNumber", form.officeNumber);
      fd.append("gstNumber", form.gstNumber);
      fd.append("panNumber", form.panNumber);
      fd.append("aadharNumber", form.aadharNumber);
      fd.append("role", form.role);
      fd.append("aboutInfo", form.aboutInfo);
      fd.append("bankAccountNumber", form.bankAccountNumber);
      fd.append("ifscCode", form.ifscCode);
      fd.append("cancelCheque", form.cancelCheque);
      fd.append("email", form.email);
      fd.append("password", form.password);

      // file fields – IMPORTANT: names backend ke hisaab se
      if (form.aadharPdf) fd.append("aadharPdf", form.aadharPdf);
      if (form.bankPdf) fd.append("bankPdf", form.bankPdf);
      if (form.certificatePdf) fd.append("certificatePdf", form.certificatePdf);

      // tumhara backend route jo bhi hai woh lagao:
      // example: /auth/register-partner ya /register
      const res = await api.post("/auth/register", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(res.data?.message || "Registration successful");

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
        role: "driver",
        aboutInfo: "",
        bankAccountNumber: "",
        ifscCode: "",
        cancelCheque: "",
        email: "",
        password: "",
        aadharPdf: null,
        bankPdf: null,
        certificatePdf: null,
      });
    } catch (err) {
      console.error("register error:", err);
      alert(err?.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
        display: "flex",
        justifyContent: "center",
        padding: "40px 12px",
      }}
    >
      <div
        style={{
          maxWidth: 640,
          width: "100%",
          background: "white",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 20px 40px rgba(15,23,42,0.25)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: 24,
            fontWeight: 800,
            marginBottom: 4,
            color: "#4f46e5",
          }}
        >
          Partner Registration
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#6b7280",
            marginBottom: 20,
            fontSize: 14,
          }}
        >
          Register your company with PuneBus and start working with us.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Company & Address */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={labelStyle}>Company Name *</label>
              <input
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Enter your company name"
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Address *</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
                placeholder="Flat / Building / Street / Landmark"
                required
              />
            </div>

            {/* State / City / Area */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={labelStyle}>State</label>
                <select
                  name="state"
                  value={form.state}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      state: e.target.value,
                      city: "",
                    }))
                  }
                  style={inputStyle}
                >
                  <option value="">Select state</option>
                  {STATE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={labelStyle}>City</label>
                <select
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  style={inputStyle}
                  disabled={!form.state}
                >
                  <option value="">
                    {form.state ? "Select city" : "Select state first"}
                  </option>
                  {availableCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={labelStyle}>Area / Locality</label>
                <input
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Area / Locality"
                />
              </div>
            </div>

            {/* Contact */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={labelStyle}>WhatsApp Phone *</label>
                <input
                  name="whatsappPhone"
                  value={form.whatsappPhone}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Primary WhatsApp number"
                  required
                />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={labelStyle}>Office Number</label>
                <input
                  name="officeNumber"
                  value={form.officeNumber}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Office phone (optional)"
                />
              </div>
            </div>

            {/* GST / PAN / Aadhar text */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 170 }}>
                <label style={labelStyle}>GST Number</label>
                <input
                  name="gstNumber"
                  value={form.gstNumber}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="GSTN"
                />
              </div>
              <div style={{ flex: 1, minWidth: 170 }}>
                <label style={labelStyle}>PAN Number</label>
                <input
                  name="panNumber"
                  value={form.panNumber}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="PAN"
                />
              </div>
              <div style={{ flex: 1, minWidth: 170 }}>
                <label style={labelStyle}>Aadhaar Number</label>
                <input
                  name="aadharNumber"
                  value={form.aadharNumber}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Aadhaar"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label style={labelStyle}>Role *</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                style={inputStyle}
                required
              >
                <option value="driver">Driver</option>
                <option value="Bus vendor">Bus Vendor</option>
                <option value="mechanic">Mechanic</option>
                <option value="cleaner">Cleaner</option>
                <option value="restaurant">Restaurant</option>
                <option value="parcel">Parcel</option>
                <option value="Dry Cleaner">Dry Cleaner</option>
              </select>
            </div>

            {/* BANK DETAILS */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={labelStyle}>Bank Account Number</label>
                <input
                  name="bankAccountNumber"
                  value={form.bankAccountNumber}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={labelStyle}>IFSC Code</label>
                <input
                  name="ifscCode"
                  value={form.ifscCode}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Cancelled Cheque (ref / text)</label>
              <input
                name="cancelCheque"
                value={form.cancelCheque}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Cheque number / bank name etc."
              />
            </div>

            {/* ABOUT */}
            <div>
              <label style={labelStyle}>About / Services</label>
              <textarea
                name="aboutInfo"
                value={form.aboutInfo}
                onChange={handleChange}
                style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
                placeholder="Short description of your services, fleet details, etc."
              />
            </div>

            {/* FILE UPLOADS – Aadhaar / Bank / Certificate PDF */}
            <div>
              <label style={labelStyle}>Aadhaar PDF</label>
              <input
                type="file"
                name="aadharPdf"
                accept="application/pdf"
                onChange={handleFileChange}
                style={fileInputStyle}
              />
              <small style={hintStyle}>
                Upload Aadhaar card as PDF – optional but recommended.
              </small>
            </div>

            <div>
              <label style={labelStyle}>Bank Account PDF</label>
              <input
                type="file"
                name="bankPdf"
                accept="application/pdf"
                onChange={handleFileChange}
                style={fileInputStyle}
              />
              <small style={hintStyle}>
                Bank passbook / statement PDF – optional.
              </small>
            </div>

            <div>
              <label style={labelStyle}>Certificate PDF</label>
              <input
                type="file"
                name="certificatePdf"
                accept="application/pdf"
                onChange={handleFileChange}
                style={fileInputStyle}
              />
              <small style={hintStyle}>
                Registration / licence certificate PDF – optional.
              </small>
            </div>

            {/* LOGIN DETAILS */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Email (optional)"
                />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Password (optional)"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: 12,
                width: "100%",
                padding: "12px 16px",
                borderRadius: 999,
                border: "none",
                fontWeight: 800,
                fontSize: 15,
                cursor: submitting ? "not-allowed" : "pointer",
                background:
                  "linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #8b5cf6 100%)",
                color: "white",
                boxShadow: "0 10px 20px rgba(79,70,229,0.4)",
              }}
            >
              {submitting ? "Registering..." : "✓ REGISTER NOW"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: 14,
  outline: "none",
};

const fileInputStyle = {
  ...inputStyle,
  padding: "8px 10px",
};

const labelStyle = {
  display: "block",
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
};

const hintStyle = {
  display: "block",
  marginTop: 4,
  fontSize: 11,
  color: "#6b7280",
};

export default Register;
