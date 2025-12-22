import React, { useEffect } from "react";
import Footer from "./Footer"; // ✅ Make sure this path is correct (e.g., "../components/Footer")

const PrivacyPolicy = () => {
  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sectionStyle = {
    marginBottom: "1.5rem",
    lineHeight: "1.6",
    color: "#334155",
  };

  const headingStyle = {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "0.75rem",
    marginTop: "2rem",
  };

  return (
    <>
      <div
        style={{
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          padding: "4rem 1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#1e293b",
              marginBottom: "0.5rem",
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ color: "#64748b", marginBottom: "2rem" }}>
            Last Updated: 22-12-2025
          </p>

          <p style={sectionStyle}>
            Namastey ("we", "our", "us") is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and safeguard your
            personal information when you use our mobile application and related
            services.
          </p>

          <h2 style={headingStyle}>1. Information We Collect</h2>
          <div style={sectionStyle}>
            <strong>a. Personal Information</strong>
            <ul
              style={{
                listStyleType: "disc",
                paddingLeft: "1.5rem",
                marginTop: "0.5rem",
              }}
            >
              <li>
                Name: Used to identify you inside the app and during booking.
              </li>
              <li>
                Mobile Number: Used for account verification (OTP), booking
                updates, and customer support.
              </li>
              <li>
                Email Address: Used for account creation, notifications, and
                sending booking details or invoices.
              </li>
            </ul>

            <strong style={{ display: "block", marginTop: "1rem" }}>
              b. Automatically Collected Information
            </strong>
            <ul
              style={{
                listStyleType: "disc",
                paddingLeft: "1.5rem",
                marginTop: "0.5rem",
              }}
            >
              <li>
                Device information (Android version, model, unique device ID).
              </li>
              <li>App usage data (crash logs, performance data).</li>
            </ul>
          </div>

          <h2 style={headingStyle}>2. How We Use Your Information</h2>
          <ul
            style={{
              ...sectionStyle,
              listStyleType: "disc",
              paddingLeft: "1.5rem",
            }}
          >
            <li>To create and manage your Namastey account.</li>
            <li>To provide luggage pickup & drop services.</li>
            <li>
              To send booking confirmation, status updates, and delivery
              notifications.
            </li>
            <li>To provide customer support.</li>
            <li>To improve app performance.</li>
          </ul>

          <h2 style={headingStyle}>3. Sharing of Information</h2>
          <p style={sectionStyle}>We may share information only with:</p>
          <ul
            style={{
              ...sectionStyle,
              listStyleType: "disc",
              paddingLeft: "1.5rem",
            }}
          >
            <li>Verified delivery executives (limited details).</li>
            <li>Service providers (SMS/Email, payments).</li>
            <li>Legal authorities when required.</li>
          </ul>

          <h2 style={headingStyle}>4. Data Security</h2>
          <p style={sectionStyle}>
            We use encrypted communication, secure storage, and access controls to
            protect your data.
          </p>

          <h2 style={headingStyle}>5. Your Rights</h2>
          <p style={sectionStyle}>
            You can request access, correction, deletion, or withdrawal of consent
            via email.
          </p>

          <h2 style={headingStyle}>6. Data Retention</h2>
          <p style={sectionStyle}>
            Data is retained while your account is active or required by law.
          </p>

          <h2 style={headingStyle}>7. Children's Privacy</h2>
          <p style={sectionStyle}>
            We do not knowingly collect data from children under 13.
          </p>

          <h2 style={headingStyle}>8. Changes to This Privacy Policy</h2>
          <p style={sectionStyle}>
            We may update this policy and notify you via app or email.
          </p>

          <h2 style={headingStyle}>9. Contact Us</h2>
          <p style={sectionStyle}>
            Email: punebus2@gmail.com <br />
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;