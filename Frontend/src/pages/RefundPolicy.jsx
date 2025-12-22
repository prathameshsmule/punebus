import React, { useEffect } from "react";
// Assuming Footer is in the components folder. If it's in pages, use "./Footer"
import Footer from "./Footer";

const RefundPolicy = () => {
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
          minHeight: "100vh", // Ensures page has height
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
            Refund & Cancellation Policy
          </h1>
          <p style={{ color: "#64748b", marginBottom: "2rem" }}>
            Last Updated: 22-12-2025
          </p>

          <h2 style={headingStyle}>1. Introduction</h2>
          <p style={sectionStyle}>
            This Refund & Cancellation Policy outlines the rules for canceling
            bookings and requesting refunds for services provided by Namastey.
          </p>

          <h2 style={headingStyle}>2. Service Cancellation by User</h2>
          <ul
            style={{
              ...sectionStyle,
              listStyleType: "disc",
              paddingLeft: "1.5rem",
            }}
          >
            <li>
              Users may cancel a booking before an executive has been assigned.
            </li>
            <li>
              If an executive is already assigned but has not reached the pickup
              location, a partial cancellation charge may apply.
            </li>
            <li>
              If the executive has already reached the pickup location, no
              refund will be issued.
            </li>
          </ul>

          <h2 style={headingStyle}>3. Service Cancellation by Namastey</h2>
          <p style={sectionStyle}>
            If Namastey cancels a booking due to operational issues or
            unavailability, the user will receive a full refund.
          </p>

          <h2 style={headingStyle}>4. Refund Policy</h2>
          <ul
            style={{
              ...sectionStyle,
              listStyleType: "disc",
              paddingLeft: "1.5rem",
            }}
          >
            <li>Refunds will be initiated within 3-7 business days.</li>
            <li>
              Refund time may vary based on the user's payment method or bank
              processing.
            </li>
            <li>Refunds are issued only to the original payment method.</li>
          </ul>

          <h2 style={headingStyle}>5. Non-Refundable Cases</h2>
          <ul
            style={{
              ...sectionStyle,
              listStyleType: "disc",
              paddingLeft: "1.5rem",
            }}
          >
            <li>User provides incorrect address or wrong contact details.</li>
            <li>Luggage is not ready at the scheduled pickup time.</li>
            <li>User is unavailable at the pickup or drop location.</li>
            <li>
              Violation of Namastey service rules or misuse of the platform.
            </li>
          </ul>

          <h2 style={headingStyle}>6. Changes to Bookings</h2>
          <ul
            style={{
              ...sectionStyle,
              listStyleType: "disc",
              paddingLeft: "1.5rem",
            }}
          >
            <li>
              Users may modify pickup time or drop details before executive
              assignment.
            </li>
            <li>
              Additional charges may apply depending on timing and distance
              adjustments.
            </li>
          </ul>

          <h2 style={headingStyle}>7. Contact for Refund or Support</h2>
          <p style={sectionStyle}>
            For cancellation assistance or refund status:
            <br />
            Email: punebus2@gmail.com <br />
          </p>

          <h2 style={headingStyle}>8. Final Note</h2>
          <p style={sectionStyle}>
            Namastey strives to deliver reliable luggage pickup and drop
            services. This policy is designed to protect both users and service
            providers and to maintain operational efficiency.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RefundPolicy;
