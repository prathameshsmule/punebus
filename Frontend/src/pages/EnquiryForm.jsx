// src/components/EnquiryForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import api from "../api/apiClient";

const initialState = {
  companyName: "",
  companyDetails: "",
  contactPersonName: "",
  contactPersonNumber: "",
  address: "",
  companyAddress: "",
  fleetCount: "",
  email: "",
  membership: "silver",
};

export default function EnquiryForm({ onSuccess } = {}) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();
  const firstErrorRef = useRef(null);

  useEffect(() => {
    if (firstErrorRef.current) {
      firstErrorRef.current.focus();
      firstErrorRef.current = null;
    }
  }, [errors]);

  const setField = (name, value) => {
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((s) => ({ ...s, [name]: null }));
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setField(name, value);
  };

  const onlyDigits = (v) => v.replace(/[^\d]/g, "");

  const onChangePhone = (e) => {
    const next = onlyDigits(e.target.value).slice(0, 10);
    setField("contactPersonNumber", next);
  };

  const onChangeFleet = (e) => {
    const next = onlyDigits(e.target.value).replace(/^0+(?=\d)/, "");
    setField("fleetCount", next);
  };

  const validate = () => {
    const err = {};

    if (!form.companyName.trim()) err.companyName = "Company name is required";
    if (!form.companyDetails.trim()) err.companyDetails = "Company details are required";
    if (!form.contactPersonName.trim()) err.contactPersonName = "Contact person name is required";
    if (!form.contactPersonNumber.trim()) err.contactPersonNumber = "Contact number is required";

    if (form.contactPersonNumber && !/^\d{10}$/.test(form.contactPersonNumber)) {
      err.contactPersonNumber = "Enter a valid 10-digit phone number";
    }

    if (form.fleetCount !== "") {
      const n = Number(form.fleetCount);
      if (!Number.isInteger(n) || n < 0) err.fleetCount = "Enter a valid non-negative whole number";
    }

    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      err.email = "Enter a valid email";
    }

    if (!["silver", "gold", "platinum"].includes(form.membership)) {
      err.membership = "Please select a membership";
    }

    return err;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerMessage(null);
    setIsSuccess(false);

    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        companyName: form.companyName,
        companyDetails: form.companyDetails,
        contactPersonName: form.contactPersonName,
        contactNo: form.contactPersonNumber, // backend expects contactNo
        address: form.address || undefined,
        companyAddress: form.companyAddress || undefined,
        email: form.email || undefined,
        membership: form.membership,
        fleetCount: form.fleetCount === "" ? undefined : Number(form.fleetCount),
        numberOfFleet: form.fleetCount === "" ? undefined : Number(form.fleetCount),
      };

      const res = await api.post("/api/enquiry", payload);
      const data = res?.data || {};

      if (data && Array.isArray(data.errors)) {
        const errs = {};
        data.errors.forEach((it) => {
          if (!it?.param) return;
          const param = it.param === "numberOfFleet" ? "fleetCount" : it.param;
          errs[param] = it.msg || it.message || "Invalid value";
        });
        setErrors(errs);
        return;
      }

      const message = data.message || "Enquiry received";
      setServerMessage(message);
      setIsSuccess(true);
      setForm(initialState);
      setErrors({});
    } catch (err) {
      const payload = err?.response?.data;
      if (payload) {
        if (Array.isArray(payload.errors)) {
          const errs = {};
          payload.errors.forEach((it) => {
            if (!it?.param) return;
            const param = it.param === "numberOfFleet" ? "fleetCount" : it.param;
            errs[param] = it.msg || it.message || "Invalid value";
          });
          setErrors(errs);
        } else if (payload.message) {
          setServerMessage(payload.message);
        } else {
          setServerMessage("Server error. Try again.");
        }
      } else {
        setServerMessage(err?.message || "Server error. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOk = () => {
    try {
      if (typeof onSuccess === "function") onSuccess();
    } catch (_) {}
    try {
      navigate("/", { replace: true });
    } catch (_) {}
  };

  const FieldError = ({ msg, id }) =>
    msg ? (
      <div id={id} style={{ color: "#ef4444", fontSize: 13, marginTop: 6 }}>{msg}</div>
    ) : null;

  const errorBindRef = (name) => (el) => {
    if (errors[name] && !firstErrorRef.current) firstErrorRef.current = el;
  };

  return (
    <section
      aria-labelledby="enquiry-heading"
      style={{
        maxWidth: 900,
        margin: "2rem auto",
        padding: "1.25rem",
        borderRadius: 12,
        boxShadow: "0 6px 24px rgba(16,24,40,0.06)",
        background: "white",
        position: "relative",
      }}
    >
      <h3 id="enquiry-heading" style={{ marginTop: 0 }}>Enquiry Form</h3>

      {serverMessage && !isSuccess && (
        <div
          role="status"
          style={{
            marginBottom: "0.75rem",
            padding: "0.75rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            backgroundColor: "#fff7ed",
            border: "1px solid #f59e0b22",
            borderRadius: 8,
            color: "#7c2d12",
            fontWeight: 600,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span>{serverMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} aria-hidden={isSuccess} noValidate>
        <div style={{ display: "grid", gap: 12 }}>
          {/* Company name */}
          <div>
            <label htmlFor="companyName" style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
              Company Name <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="companyName"
              name="companyName"
              value={form.companyName}
              onChange={onChange}
              placeholder="e.g., Pune Transport Services"
              ref={errorBindRef("companyName")}
              aria-invalid={!!errors.companyName}
              aria-describedby={errors.companyName ? "err-companyName" : undefined}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: errors.companyName ? "1px solid #ef4444" : "1px solid #e2e8f0",
              }}
              disabled={loading || isSuccess}
            />
            <FieldError id="err-companyName" msg={errors.companyName} />
          </div>

          {/* Company details */}
          <div>
            <label htmlFor="companyDetails" style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
              Company Details <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              id="companyDetails"
              name="companyDetails"
              value={form.companyDetails}
              onChange={onChange}
              rows={3}
              placeholder="e.g., Bus operator with city & intercity fleet"
              ref={errorBindRef("companyDetails")}
              aria-invalid={!!errors.companyDetails}
              aria-describedby={errors.companyDetails ? "err-companyDetails" : undefined}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: errors.companyDetails ? "1px solid #ef4444" : "1px solid #e2e8f0",
                resize: "vertical",
              }}
              disabled={loading || isSuccess}
            />
            <FieldError id="err-companyDetails" msg={errors.companyDetails} />
          </div>

          {/* Contact person */}
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label htmlFor="contactPersonName" style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
                Contact Person Name <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="contactPersonName"
                name="contactPersonName"
                value={form.contactPersonName}
                onChange={onChange}
                placeholder="e.g., Suresh Sharma"
                ref={errorBindRef("contactPersonName")}
                aria-invalid={!!errors.contactPersonName}
                aria-describedby={errors.contactPersonName ? "err-contactPersonName" : undefined}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: errors.contactPersonName ? "1px solid #ef4444" : "1px solid #e2e8f0",
                }}
                disabled={loading || isSuccess}
              />
              <FieldError id="err-contactPersonName" msg={errors.contactPersonName} />
            </div>

            <div>
              <label htmlFor="contactPersonNumber" style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
                Contact Person Number <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="contactPersonNumber"
                name="contactPersonNumber"
                value={form.contactPersonNumber}
                onChange={onChangePhone}
                inputMode="numeric"
                pattern="\d*"
                maxLength={10}
                placeholder="e.g., 9923400442"
                ref={errorBindRef("contactPersonNumber")}
                aria-invalid={!!errors.contactPersonNumber}
                aria-describedby={errors.contactPersonNumber ? "err-contactPersonNumber" : undefined}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: errors.contactPersonNumber ? "1px solid #ef4444" : "1px solid #e2e8f0",
                }}
                disabled={loading || isSuccess}
              />
              <FieldError id="err-contactPersonNumber" msg={errors.contactPersonNumber} />
            </div>
          </div>

          {/* Addresses */}
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label htmlFor="address" style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
                Address (optional)
              </label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={onChange}
                rows={3}
                placeholder="Alternate/personal address"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  resize: "vertical",
                }}
                disabled={loading || isSuccess}
              />
            </div>

            <div>
              <label htmlFor="companyAddress" style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
                Company Address
              </label>
              <textarea
                id="companyAddress"
                name="companyAddress"
                value={form.companyAddress}
                onChange={onChange}
                rows={3}
                placeholder="Registered office / depot address"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  resize: "vertical",
                }}
                disabled={loading || isSuccess}
              />
            </div>
          </div>

          {/* Fleet + Email */}
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label htmlFor="fleetCount" style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
                Number of Fleet (buses)
              </label>
              <input
                id="fleetCount"
                name="fleetCount"
                value={form.fleetCount}
                onChange={onChangeFleet}
                inputMode="numeric"
                pattern="\d*"
                placeholder="e.g., 25"
                ref={errorBindRef("fleetCount")}
                aria-invalid={!!errors.fleetCount}
                aria-describedby={errors.fleetCount ? "err-fleetCount" : undefined}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: errors.fleetCount ? "1px solid #ef4444" : "1px solid #e2e8f0",
                }}
                disabled={loading || isSuccess}
              />
              <FieldError id="err-fleetCount" msg={errors.fleetCount} />
            </div>

            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="optional"
                ref={errorBindRef("email")}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "err-email" : undefined}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: errors.email ? "1px solid #ef4444" : "1px solid #e2e8f0",
                }}
                disabled={loading || isSuccess}
              />
              <FieldError id="err-email" msg={errors.email} />
            </div>
          </div>

          {/* Membership */}
          <div>
            <label htmlFor="membership" style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
              Membership <span style={{ color: "red" }}>*</span>
            </label>
            <select
              id="membership"
              name="membership"
              value={form.membership}
              onChange={onChange}
              ref={errorBindRef("membership")}
              aria-invalid={!!errors.membership}
              aria-describedby={errors.membership ? "err-membership" : undefined}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: errors.membership ? "1px solid #ef4444" : "1px solid #e2e8f0",
                background: "white",
              }}
              disabled={loading || isSuccess}
            >
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>
            <FieldError id="err-membership" msg={errors.membership} />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="submit"
              disabled={loading || isSuccess}
              style={{
                flex: 1,
                padding: "0.9rem 1rem",
                borderRadius: 10,
                border: "none",
                backgroundColor: "#1e40af",
                color: "white",
                fontWeight: 700,
                cursor: loading || isSuccess ? "default" : "pointer",
                opacity: loading || isSuccess ? 0.8 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              {loading ? "Submitting..." : "Send Enquiry"}
              {loading && (
                <svg width="18" height="18" viewBox="0 0 100 100" aria-hidden>
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="#fff"
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray="164.93361431346415 56.97787143782138"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      repeatCount="indefinite"
                      dur="1s"
                      values="0 50 50;360 50 50"
                    />
                  </circle>
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setForm(initialState);
                setErrors({});
                setServerMessage(null);
                setIsSuccess(false);
              }}
              style={{
                padding: "0.9rem 1rem",
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                background: "white",
                cursor: "pointer",
              }}
              disabled={loading || isSuccess}
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      <small style={{ display: "block", marginTop: 12, color: "#64748b" }}>
        We keep your data safe. We will not contact you without the required details.
      </small>

      {/* Success overlay */}
      {isSuccess && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Success message"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            borderRadius: 12,
            padding: 20,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              width: 360,
              maxWidth: "90%",
              background: "white",
              borderRadius: 12,
              boxShadow: "0 8px 40px rgba(2,6,23,0.2)",
              padding: "1.25rem 1.5rem",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <CheckCircle size={28} />
              <h4 style={{ margin: 0 }}>Thank you!</h4>
            </div>

            <p style={{ marginTop: 8, marginBottom: 16, color: "#475569" }}>
              {serverMessage || "Thank you for your enquiry. We'll reach out soon."}
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <button
                onClick={handleOk}
                style={{
                  padding: "0.6rem 1rem",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: "#1e40af",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
