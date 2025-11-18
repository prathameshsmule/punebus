// Footer.jsx
import React from "react";
import { Bus, Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      id="contact"
      style={{
        backgroundColor: "#1e293b",
        color: "white",
        padding: "3rem 1.5rem 2rem",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "3rem",
            marginBottom: "3rem",
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <Bus
                style={{ width: 32, height: 32, color: "#60a5fa" }}
                aria-hidden="true"
              />
              <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                Pune Bus
              </span>
            </div>

            <p style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
              Empowering bus operators across Pune with modern technology and
              exceptional service.
            </p>

            {/* Social Media */}
            <div
              style={{
                marginTop: "1.5rem",
                display: "flex",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              <a
                href="https://www.facebook.com/share/1FFcp6Zox1/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-icon fb"
                style={{ textDecoration: "none" }}
              >
                <Facebook style={{ width: 24, height: 24 }} />
              </a>

              <a
                href="https://www.instagram.com/punebus2?igsh=MXM5d3MzNG15cDlkZg=="
                target="_blank"
                rel="noopener noreferrer"
                className="footer-icon ig"
                style={{ textDecoration: "none" }}
              >
                <Instagram style={{ width: 24, height: 24 }} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
              }}
            >
              Quick Links
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: "0.75rem" }}>
                <a
                  href="services"
                  style={{ color: "#cbd5e1", textDecoration: "none" }}
                >
                  Services
                </a>
              </li>
              <li style={{ marginBottom: "0.75rem" }}>
                <a
                  href="register"
                  style={{ color: "#cbd5e1", textDecoration: "none" }}
                >
                  Register
                </a>
              </li>
              <li style={{ marginBottom: "0.75rem" }}>
                <a
                  href="#contact"
                  style={{ color: "#cbd5e1", textDecoration: "none" }}
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
              }}
            >
              Contact Us
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <a
                href="tel:+91 9923400414"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#cbd5e1",
                  textDecoration: "none",
                }}
              >
                <Phone style={{ width: 18, height: 18 }} aria-hidden="true" />
                +91 9923400414
              </a>

              <a
                href="mailto:punebus2@gmail.com"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#cbd5e1",
                  textDecoration: "none",
                }}
              >
                <Mail style={{ width: 18, height: 18 }} aria-hidden="true" />
                punebus2@gmail.com
              </a>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  color: "#cbd5e1",
                }}
              >
                <MapPin
                  style={{
                    width: 18,
                    height: 18,
                    marginTop: "0.25rem",
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                />
                <span>
                  Unit 101, Oxford Towers,
                  <br />
                  Airport Road, Bangalore,
                  <br />
                  Karnataka 560008
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid #334155",
            paddingTop: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            color: "#94a3b8",
            fontSize: "0.875rem",
            textAlign: "center",
          }}
        >
          <p>&copy; 2025 Pune Bus. All rights reserved.</p>

          <div style={{ display: "flex", gap: "2rem" }}>
            <a href="#" style={{ color: "#94a3b8", textDecoration: "none" }}>
              Privacy Policy
            </a>
            <a href="#" style={{ color: "#94a3b8", textDecoration: "none" }}>
              Terms of Service
            </a>
          </div>
        </div>
      </div>

      {/* Hover Effects */}
      <style>{`
        footer a:hover { color: #60a5fa !important; }
        footer a:focus { outline: 2px solid #60a5fa; outline-offset: 4px; border-radius: 4px; }

        /* Social Icons */
        .footer-icon {
          color: #cbd5e1;
          transition: all 0.3s ease;
        }

        /* Facebook Hover */
        .footer-icon.fb:hover {
          color: #1877f2;
          transform: scale(1.2);
        }

        /* Instagram Hover */
        .footer-icon.ig:hover {
          color: #d946ef;
          transform: scale(1.2);
        }
      `}</style>
    </footer>
  );
}
