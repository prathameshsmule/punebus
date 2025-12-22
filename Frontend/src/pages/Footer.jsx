import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";
import puneLogo from "../assets/logo.png";
import EnquiryForm from "../pages/EnquiryForm";

// ✅ Local ModalPortal – footer se hi modal banega
const ModalPortal = ({ children, onClose }) => {
  const [container] = useState(() => {
    let root = document.getElementById("modal-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "modal-root";
      document.body.appendChild(root);
    }
    const wrapper = document.createElement("div");
    wrapper.className = "modal-container";
    return { root, wrapper };
  });

  useEffect(() => {
    const { root, wrapper } = container;
    root.appendChild(wrapper);

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight || "";
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (scrollBarWidth > 0)
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      try {
        root.removeChild(wrapper);
      } catch {}
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      window.removeEventListener("keydown", onKey);
    };
  }, [container, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("modal-backdrop")) onClose();
  };

  return ReactDOM.createPortal(
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onMouseDown={handleBackdropClick}
    >
      <div className="modal-box" tabIndex={-1} role="document">
        <button
          className="modal-close"
          aria-label="Close enquiry"
          onClick={onClose}
        >
          ✕
        </button>
        <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </div>,
    container.wrapper
  );
};

export default function Footer() {
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [exiting, setExiting] = useState(false);

  const handleContactClick = (e) => {
    e.preventDefault();
    setExiting(false);
    setShowEnquiry(true);
  };

  const closeEnquiry = () => {
    setExiting(true);
    setTimeout(() => {
      setShowEnquiry(false);
      setExiting(false);
    }, 300); // slide-out animation ke liye
  };

  const handleEnquirySuccess = () => {
    setExiting(true);
    setTimeout(() => {
      setShowEnquiry(false);
      setExiting(false);
    }, 300);
  };

  useEffect(() => {
    if (showEnquiry) {
      setTimeout(() => {
        const el = document.querySelector(
          ".modal-content input, .modal-content textarea, .modal-content select"
        );
        if (el) el.focus();
      }, 80);
    }
  }, [showEnquiry]);

  return (
    <>
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
                <img
                  src={puneLogo}
                  alt="Pune Bus Logo"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "white",
                    padding: "4px",
                    objectFit: "cover",
                  }}
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
                    href="/services"
                    style={{ color: "#cbd5e1", textDecoration: "none" }}
                  >
                    Services
                  </a>
                </li>
                <li style={{ marginBottom: "0.75rem" }}>
                  <a
                    href="/register"
                    style={{ color: "#cbd5e1", textDecoration: "none" }}
                  >
                    Register
                  </a>
                </li>
                <li style={{ marginBottom: "0.75rem" }}>
                  {/* 👉 yaha se modal open hoga */}
                  <a
                    href="#contact"
                    onClick={handleContactClick}
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

          {/* Bottom Bar - Mobile Responsive Update */}
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

            <div
              style={{
                display: "flex",
                gap: "1.5rem", // Mobile ke liye gap thoda kam kiya (pehle 2rem tha)
                flexWrap: "wrap",
                justifyContent: "center",
                lineHeight: "1.8", // Mobile pe lines ke beech space
              }}
            >
              <a
                href="/privacy"
                style={{ color: "#94a3b8", textDecoration: "none" }}
              >
                Privacy Policy
              </a>
              <a
                href="/refund-policy"
                style={{ color: "#94a3b8", textDecoration: "none" }}
              >
                Refund & Cancellation Policy
              </a>
              {/* Link Uncommented aur 'Terms & Conditions' add kiya */}
              
            </div>
          </div>
        </div>

        {/* Hover Effects */}
        <style>{`
          footer a:hover { color: #60a5fa !important; }
          footer a:focus { outline: 2px solid #60a5fa; outline-offset: 4px; border-radius: 4px; }

          .footer-icon {
            color: #cbd5e1;
            transition: all 0.3s ease;
          }

          .footer-icon.fb:hover {
            color: #1877f2;
            transform: scale(1.2);
          }

          .footer-icon.ig:hover {
            color: #d946ef;
            transform: scale(1.2);
          }

          button:hover {
            filter: brightness(1.05);
          }
        `}</style>
      </footer>

      {/* ✅ Footer ka apna enquiry modal */}
      {showEnquiry && (
        <ModalPortal onClose={closeEnquiry}>
          <div
            className={`enquiry-inner ${exiting ? "slide-out" : "slide-in"}`}
          >
            <EnquiryForm onSuccess={handleEnquirySuccess} />
          </div>
        </ModalPortal>
      )}
    </>
  );
}
