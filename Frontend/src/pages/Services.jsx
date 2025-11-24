import React, { useState, useEffect } from "react";
import mechanicImg from "../assets/mechanic.jpg";
import driverImg from "../assets/driver.jpg";
import namstey from "../assets/namstey-image.jpg";
import max_seat from "../assets/max_seat2.jpg";
import replacementBusImg from "../assets/replce_bus.jpg";
import Footer from "./Footer";
import roadImg from "../assets/RoadAssistance.jpg";

// ✅ enquiry form ko as component use kar rahe hain
import EnquiryForm from "../pages/EnquiryForm";

/* ---------------------- Added helper utilities ---------------------- */
const getServiceImage = (serviceId) => {
  const images = {
    s1: max_seat,
    s2: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=400&h=300&fit=crop",
    s3: driverImg,
    s4: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
    s5: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop",
    g1: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
    g3: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400&h=300&fit=crop",
    g4: mechanicImg,
    g7: roadImg,
    s6: mechanicImg,
    g5: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    g6: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    p1: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
    p2: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    p3: namstey,
    p4: replacementBusImg,
    p5: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop",
  };
  return (
    images[serviceId] ||
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop"
  );
};

const getDetailedDescription = (serviceId) => {
  const descriptions = {
    s1: "Lists your bus online & offline to keep seats full. Real-time sync ensures accuracy and higher revenue",
    s2: "We provide accurate, real-time pickup and drop-off information to both passengers and drivers. Our system includes GPS tracking, estimated arrival times, and automated notifications. Passengers receive timely updates about their journey, while drivers get optimized route information to ensure smooth operations.",
    s3: "Our driver confirmation system ensures all schedules and assignments are properly acknowledged and tracked. Drivers receive instant notifications about their assignments, route changes, and schedule updates. This systematic approach reduces miscommunication and ensures reliable service delivery.",
    s4: "Collect valuable passenger feedback through our comprehensive rating and review system. Monitor service quality in real-time, identify areas for improvement, and respond to passenger concerns promptly. Our analytics dashboard provides insights into passenger satisfaction trends and helps maintain high service standards.",
    s5: "Comprehensive training programs designed to enhance staff professionalism, safety awareness, and customer service skills. Our structured curriculum covers driving techniques, passenger interaction, emergency procedures, and service excellence. Regular training sessions ensure your team stays updated with industry best practices.",
    g1: "Scheduled cleaning and preventive maintenance services to keep your buses in top condition. Our systematic approach includes daily cleaning routines, periodic deep cleaning, and regular mechanical inspections. We ensure a safe, hygienic, and comfortable environment for passengers while extending vehicle lifespan.",
    g3: "Expand your revenue streams with integrated parcel booking and tracking services. Our system allows passengers to book parcel space alongside their seats, with real-time tracking and delivery confirmations. Perfect for connecting remote areas and providing additional value to your customers.",
    g4: "Our Roadside Assistance service offers quick help during breakdowns with full RTO support.We ensure legal and safe recovery of your bus through authorized inspection and towing.Our team coordinates directly with RTO officials for on-site issue resolution.Get hassle-free, compliant assistance anytime your bus needs help on the road..",
    g5: "Strategic guidance and operational support to improve passenger ratings and reviews. We analyze feedback patterns, identify improvement opportunities, and implement actionable solutions. Our experts work with your team to enhance service quality and boost your reputation.",
    g6: "Our Gold Package includes all Silver features plus exclusive premium benefits.Get advanced driver and conductor training, priority roadside assistance, and replacement support.Designed for those who want top-tier safety, reliability, and professional service.",
    p1: "The Platinum package includes all features from both Silver and Gold packages, providing you with the complete suite of essential and premium services. This comprehensive offering ensures you have access to every tool and service needed to run a world-class bus operation.",
    p2: "Dedicated executives handle special pickups, VIP bookings, and high-value customers with personalized attention. Our team coordinates complex logistics, ensures premium service delivery, and maintains direct communication channels for exclusive clients requiring special arrangements.",
    p3: "Professional welcome assistants greet passengers at boarding points, provide assistance with luggage, guide them to their seats, and ensure a warm, hospitable start to their journey. This personalized touch elevates the passenger experience and reinforces your premium brand positioning.",
    p4: "In case of major breakdowns or accidents, we arrange rapid replacement buses to ensure passengers reach their destinations with minimal delay. Our emergency response team coordinates alternative transport, manages passenger communication, and handles all logistics to maintain service continuity.",
    p5: "Premium passengers receive priority boarding, dedicated assistance, and expedited service at all touchpoints. Our team ensures VIP customers enjoy a seamless, comfortable experience with personalized attention throughout their journey, reinforcing loyalty and satisfaction.",
    s6: "Round-the-clock mechanical support for your buses. Our team helps diagnose issues over phone, guide your staff with quick fixes, and coordinate with local mechanics when needed. This ensures minimum downtime and keeps your buses back on road faster, even during late-night or off-peak hours.",
  };
  return descriptions[serviceId] || "Complete service description coming soon.";
};

/* ---------------------- NEW (added) small title helper ---------------------- */
const getServiceTitle = (serviceId) => {
  const titles = {
    s1: "Maximum Seats Filled",
    s2: "Customer Pickup & Drop Information",
    s3: "Driver Confirmation",
    s4: "Passenger Feedback System",
    s5: "Driver & Conductor Training",
    g1: "Bus Cleaning & Maintenance",
    g3: "Parcel Integration",
    g4: "Roadside Assistance",
    g5: "Rating Improvement Support",
    g6: "Driver & Conductor Training",
    p1: "Includes SILVER & GOLD PACKAGES",
    p2: "Special Pickup Executive",
    p3: "Namastey Service (Welcome Assistants)",
    p4: "Emergency Bus Replacement",
    s6: "24/7 Mechanical Support",
    p5: "Priority Passenger Handling",
  };
  return titles[serviceId] || "Highlighted Service";
};

/* ---------------------- PREMIUM Local advertisers (used in Sponsors) ---------------------- */
const localAdvertisers = [
  {
    name: "Haldiram's",
    url: "https://www.haldirams.com",
    logo: "https://logo.clearbit.com/haldirams.com",
  },
  {
    name: "Lay's",
    url: "https://www.lays.com",
    logo: "https://logo.clearbit.com/lays.com",
  },
  {
    name: "Parle",
    url: "https://www.parleproducts.com",
    logo: "https://logo.clearbit.com/parleproducts.com",
  },
  {
    name: "Amul",
    url: "https://amul.com",
    logo: "https://logo.clearbit.com/amul.com",
  },
  {
    name: "Fevicol",
    url: "https://www.fevicol.in",
    logo: "https://logo.clearbit.com/fevicol.in",
  },
  {
    name: "Patanjali",
    url: "https://www.patanjaliayurved.net",
    logo: "https://logo.clearbit.com/patanjaliayurved.net",
  },
];

const ServicesPanel = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // enquiry modal
  const [showEnquiry, setShowEnquiry] = useState(false);

  // track hover for sponsors track
  const [trackHover, setTrackHover] = useState(false);

  // hover states
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);

  // fallback/default services
  const fallbackServices = [
    // SILVER
    {
      id: "s1",
      title: "Maximum Seats Filled",
      description:
        "Seat filling management both online and offline to keep occupancy high.",
      package: "silver",
    },
    {
      id: "s2",
      title: "Customer Pickup & Drop Information",
      description:
        "Accurate pickup and drop details provided to passengers and drivers.",
      package: "silver",
    },
    {
      id: "s3",
      title: "Driver Confirmation",
      description:
        "Driver confirmation system to ensure schedules and assignments are acknowledged.",
      package: "silver",
    },
    
    {
      id: "s4",
      title: "Passenger Feedback System",
      description:
        "Collect passenger feedback and ratings to monitor service quality.",
      package: "silver",
    },

    // GOLD
    {
      id: "g6",
      title: "Includes SILVER PACKAGES",
      description:
        "All Silver  features is included in this plan, plus exclusive gold benefits.",
      package: "gold",
    },
    {
      id: "g1",
      title: "Bus Cleaning & Maintenance",
      description:
        "Scheduled cleaning and routine maintenance for a safer, cleaner ride.",
      package: "gold",
    },
    {
      id: "g3",
      title: "Parcel Integration",
      description:
        "Option to handle small parcel bookings and parcel tracking integration.",
      package: "gold",
    },
    {
      id: "g7",
      title: "Roadside Assistance",
      description:
        "Our Roadside Assistance service offers quick help during breakdowns with full RTO support",
      package: "gold",
    },
    {
      id: "g5",
      title: "Rating Improvement Support",
      description:
        "Guidance and operational help to improve passenger ratings and reviews.",
      package: "gold",
    },

    // PLATINUM
    {
      id: "p1",
      title: "Includes SILVER & GOLD PACKAGES",
      description:
        "All Silver + Gold features are included in this plan, plus exclusive Platinum benefits.",
      package: "platinum",
    },
    {
      id: "p2",
      title: "Special Pickup Executive",
      description:
        "Dedicated executive for special pickups and high-value bookings.",
      package: "platinum",
    },
    {
      id: "p3",
      title: "Namastey Service (Welcome Assistants)",
      description:
        "Welcome assistants to greet passengers and provide boarding help.",
      package: "platinum",
    },
    {
      id: "p4",
      title: "Emergency Bus Replacement",
      description:
        "Rapid replacement bus arrangement in case of major breakdowns.",
      package: "platinum",
    },
    {
      id: "p5",
      title: "Priority Passenger Handling",
      description: "Priority boarding and assistance for premium passengers.",
      package: "platinum",
    },
    {
      id: "s6",
      title: "24/7 Mechanical Support",
      description:
        "Round-the-clock mechanical helpline and on-road troubleshooting support for your buses.",
      package: "platinum",
    },
  ];

  useEffect(() => {
    fetch("/api/services")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          setServices(data);
          setError(false);
        } else {
          setServices(fallbackServices);
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setServices(fallbackServices);
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedService) {
      const handleEscape = (e) => {
        if (e.key === "Escape") setSelectedService(null);
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [selectedService]);

  const filterServices = (pkg) => {
    return services.filter(
      (s) =>
        (s.package === pkg || (!s.package && pkg === "silver")) &&
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const packages = [
    {
      id: "silver",
      title: "SILVER PACKAGE",
      subtitle: "(BASIC PLAN)",
      gradient: "linear-gradient(to bottom, #7dd3fc, #bae6fd)",
      icon: "🥈",
    },
    {
      id: "gold",
      title: "GOLD PACKAGE",
      subtitle: "(PREMIUM PLAN)",
      gradient: "linear-gradient(to bottom, #fbbf24, #fb923c)",
      icon: "🥇",
    },
    {
      id: "platinum",
      title: "PLATINUM PACKAGE",
      subtitle: "(ELITE PLAN)",
      gradient: "linear-gradient(to bottom, #a78bfa, #c4b5fd)",
      icon: "💎",
    },
  ];

  const getServiceIcon = (index, serviceId) => {
    if (serviceId && serviceId.startsWith("s")) {
      const silverIcons = ["🚌", "📍", "👨‍✈️", "💬"];
      return silverIcons[index % silverIcons.length];
    }
    if (serviceId && serviceId.startsWith("g")) {
      const goldIcons = ["🥈", "🎧", "📦", "🔧", "⭐", "📘"];
      return goldIcons[index % goldIcons.length];
    }
    if (serviceId && serviceId === "p1") return "🥈 🥇";
    if (serviceId && serviceId.startsWith("p")) {
      const platIcons = ["🧑‍💼", "🤝", "🚐", "🎟️"];
      return platIcons[index % platIcons.length];
    }
    const icons = ["🔧", "🧹", "🚌", "👨‍✈️", "📞", "🛠️", "🚗", "⚙️"];
    return icons[index % icons.length];
  };

  const styles = {
    container: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "40px 20px",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    cardsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "24px",
      marginBottom: "32px",
    },
    card: {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      minHeight: "600px",
    },
    cardHeader: {
      padding: "48px 24px",
      textAlign: "center",
      color: "#ffffff",
    },
    cardIcon: { fontSize: "48px", marginBottom: "16px", display: "block" },
    cardTitle: { fontSize: "28px", fontWeight: "800", marginBottom: "8px" },
    cardSubtitle: { fontSize: "14px", fontWeight: "500", opacity: "0.95" },
    cardBody: { padding: "32px 24px", flex: "1" },
    serviceList: { listStyle: "none", padding: "0", margin: "0" },
    serviceItem: {
      display: "flex",
      alignItems: "flex-start",
      padding: "16px",
      marginBottom: "12px",
      backgroundColor: "#f9fafb",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "all 0.2s",
      border: "1px solid transparent",
    },
    serviceItemHover: {
      backgroundColor: "#f3f4f6",
      borderColor: "#e5e7eb",
      transform: "translateX(4px)",
    },
    serviceIconCircle: {
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      backgroundColor: "#eef2ff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      flexShrink: "0",
      marginRight: "14px",
    },
    serviceTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#111827",
      marginBottom: "4px",
    },
    serviceDescription: { fontSize: "14px", color: "#6b7280" },
    ctaButton: {
      width: "100%",
      padding: "14px",
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "background-color 0.2s",
      marginTop: "16px",
    },
    modal: {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "1000",
    },
    modalContent: {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "32px",
      maxWidth: "560px",
      width: "100%",
      maxHeight: "80vh",
      overflow: "auto",
      position: "relative",
    },
    modalClose: {
      position: "absolute",
      top: "16px",
      right: "16px",
      width: "32px",
      height: "32px",
      border: "none",
      backgroundColor: "#f3f4f6",
      borderRadius: "50%",
      cursor: "pointer",
      fontSize: "20px",
    },
    modalTitle: { fontSize: "24px", fontWeight: "700", marginBottom: "12px" },
    modalDescription: { fontSize: "16px", color: "#6b7280" },
    modalImage: {
      width: "100%",
      height: "220px",
      objectFit: "cover",
      borderRadius: "12px",
      marginBottom: "16px",
      background: "#e5e7eb",
    },

    /* ---------------- NEW styles for Highlighted Service ---------------- */
    highlightedWrap: {
      display: "grid",
      gridTemplateColumns: "1.2fr 1.8fr",
      gap: "24px",
      alignItems: "center",
      background: "linear-gradient(90deg, #f0f9ff, #fff)",
      border: "1px solid #e5e7eb",
      borderRadius: "16px",
      padding: "24px",
      marginTop: "40px",
      boxShadow: "0 6px 12px rgba(0,0,0,0.06)",
    },
    highlightedBadge: {
      display: "inline-block",
      backgroundColor: "#f59e0b",
      color: "#111827",
      fontWeight: 700,
      padding: "6px 10px",
      borderRadius: "9999px",
      fontSize: "12px",
      letterSpacing: "0.3px",
      marginBottom: "10px",
    },
    highlightedImage: {
      width: "100%",
      height: "100%",
      maxHeight: "360px",
      objectFit: "cover",
      borderRadius: "12px",
      background: "#e5e7eb",
    },
    highlightedTitle: { fontSize: "28px", fontWeight: "800", color: "#111827" },
    highlightedSub: { fontSize: "14px", color: "#6b7280", marginTop: "6px" },
    highlightedActions: { display: "flex", gap: "12px", marginTop: "16px" },
    primaryBtn: {
      padding: "12px 16px",
      borderRadius: "10px",
      border: "none",
      background: "#3b82f6",
      color: "#fff",
      fontWeight: 700,
      cursor: "pointer",
    },
    ghostBtn: {
      padding: "12px 16px",
      borderRadius: "10px",
      border: "1px solid #d1d5db",
      background: "#ffffff",
      color: "#111827",
      fontWeight: 600,
      cursor: "pointer",
    },
  };

  /* ---------------------- Sponsors Slider styles ---------------------- */
  const partnerStyles = {
    wrap: {
      marginTop: "56px",
      marginBottom: "56px",
      padding: "28px",
      borderRadius: "16px",
      border: "1px solid #e5e7eb",
      background: trackHover
        ? "linear-gradient(90deg, #eef2ff, #ffffff)"
        : "linear-gradient(90deg, #f8fafc, #ffffff)",
      boxShadow: "0 6px 12px rgba(0,0,0,0.04)",
      transition: "background 0.2s ease",
    },
    headingRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "18px",
    },
    hTitle: { fontSize: "22px", fontWeight: 800, color: "#111827" },
    hSub: { fontSize: "14px", color: "#6b7280" },
    viewport: {
      position: "relative",
      overflow: "hidden",
      width: "100%",
      borderRadius: "14px",
    },
    track: {
      display: "flex",
      alignItems: "center",
      gap: "56px",
      width: "max-content",
      animation: "partners-scroll 25s linear infinite",
      padding: "18px 24px",
    },
    item: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
      minWidth: "220px",
      padding: "16px 20px",
      borderRadius: "14px",
      background: "#ffffff",
      border: "1px solid #e5e7ff",
      boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
      transition:
        "transform .2s ease, background-color .2s ease, box-shadow .2s ease",
    },
    logo: {
      width: "140px",
      height: "60px",
      objectFit: "contain",
    },
    name: { fontSize: "14px", color: "#6b7280", whiteSpace: "nowrap" },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.cardsGrid}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{ ...styles.card, backgroundColor: "#e5e7eb" }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  /* -------------- Choose which single service to highlight --------------- */
  const HIGHLIGHTED_SERVICE_ID = "p4";
  const highlightedTitle = getServiceTitle(HIGHLIGHTED_SERVICE_ID);
  const highlightedDesc = getDetailedDescription(HIGHLIGHTED_SERVICE_ID);
  const highlightedImg = getServiceImage(HIGHLIGHTED_SERVICE_ID);
  /* -------------------------------------------------------------------- */

  return (
    <>
      <div style={styles.container}>
        {/* Heading Section */}
        <h1
          style={{
            textAlign: "center",
            fontSize: "36px",
            fontWeight: "800",
            color: "#111827",
            marginBottom: "12px",
          }}
        >
          Our Service Packages
        </h1>
        <p
          style={{
            textAlign: "center",
            fontSize: "16px",
            color: "#6b7280",
            marginBottom: "40px",
          }}
        >
          Choose from Silver, Gold, or Platinum packages designed to fit your
          bus service needs.
        </p>

        <div style={styles.cardsGrid}>
          {packages.map((pkg) => {
            const pkgServices = filterServices(pkg.id);
            return (
              <div key={pkg.id} style={styles.card}>
                <div style={{ ...styles.cardHeader, background: pkg.gradient }}>
                  <span style={styles.cardIcon}>{pkg.icon}</span>
                  <h2 style={styles.cardTitle}>{pkg.title}</h2>
                  <p style={styles.cardSubtitle}>{pkg.subtitle}</p>
                </div>

                <div style={styles.cardBody}>
                  {pkgServices.length > 0 ? (
                    <ul style={styles.serviceList}>
                      {pkgServices.map((service, index) => (
                        <li key={service.id}>
                          <button
                            style={{
                              ...styles.serviceItem,
                              ...(hoveredItem === `${pkg.id}-${service.id}`
                                ? styles.serviceItemHover
                                : {}),
                            }}
                            onClick={() => setSelectedService(service)}
                            onMouseEnter={() =>
                              setHoveredItem(`${pkg.id}-${service.id}`)
                            }
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <div style={styles.serviceIconCircle}>
                              {getServiceIcon(index, service.id)}
                            </div>
                            <div>
                              <div style={styles.serviceTitle}>
                                {service.title}
                              </div>
                              <div style={styles.serviceDescription}>
                                {service.description}
                              </div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ textAlign: "center", color: "#9ca3af" }}>
                      No services found.
                    </div>
                  )}

                  {/* ✅ Contact Support → Enquiry modal open karega */}
                  <button
                    style={{
                      ...styles.ctaButton,
                      backgroundColor:
                        hoveredButton === pkg.id ? "#2563eb" : "#3b82f6",
                    }}
                    onMouseEnter={() => setHoveredButton(pkg.id)}
                    onMouseLeave={() => setHoveredButton(null)}
                    onClick={() => setShowEnquiry(true)}
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ---------------- Maximum Seats Filled Highlight ---------------- */}
        <section style={styles.highlightedWrap} aria-labelledby="seats-title">
          <div>
            <img
              src={max_seat}
              alt={getServiceTitle("s1")}
              style={styles.highlightedImage}
              loading="lazy"
            />
          </div>
          <div>
            <span style={styles.highlightedBadge}>Maximum Seats Filled</span>
            <h2 id="seats-title" style={styles.highlightedTitle}>
              {getServiceTitle("s1")}
            </h2>
            <p style={styles.highlightedSub}>
              Optimize occupancy across online and offline
              channels—automatically.
            </p>
            <p style={{ marginTop: 14, color: "#374151", lineHeight: 1.65 }}>
              {getDetailedDescription("s1")}
            </p>
            <div style={styles.highlightedActions}>
              
              <button
                style={styles.ghostBtn}
                onClick={() =>
                  setSelectedService({ id: "s1", title: getServiceTitle("s1") })
                }
              >
                View Details
              </button>
            </div>
          </div>
        </section>

        {/* Service details modal */}
        {selectedService && (
          <div style={styles.modal} onClick={() => setSelectedService(null)}>
            <div
              style={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                style={styles.modalClose}
                onClick={() => setSelectedService(null)}
                aria-label="Close details"
                title="Close"
              >
                ×
              </button>

              <img
                src={getServiceImage(selectedService.id)}
                alt={selectedService.title}
                style={styles.modalImage}
                loading="lazy"
              />
              <h3 style={styles.modalTitle}>{selectedService.title}</h3>
              <p style={styles.modalDescription}>
                {getDetailedDescription(selectedService.id)}
              </p>
            </div>
          </div>
        )}

          <section
          style={styles.highlightedWrap}
          aria-labelledby="highlighted-title"
        >
          {/* Left: Image */}
          <div>
            <img
              src={replacementBusImg}
              alt={highlightedTitle}
              style={styles.highlightedImage}
              loading="lazy"
            />
          </div>

          {/* Right: Content */}
          <div>
            <span style={styles.highlightedBadge}>Highlighted Service</span>
            <h2 id="highlighted-title" style={styles.highlightedTitle}>
              {highlightedTitle}
            </h2>
            <p style={styles.highlightedSub}>
              Part of our premium offerings — crafted to keep your operations
              smooth and your passengers happy.
            </p>
            <p
              style={{ marginTop: "14px", color: "#374151", lineHeight: 1.65 }}
            >
              {highlightedDesc}
            </p>

            <div style={styles.highlightedActions}>
              
              <button
                style={styles.ghostBtn}
                onClick={() =>
                  setSelectedService({
                    id: HIGHLIGHTED_SERVICE_ID,
                    title: highlightedTitle,
                  })
                }
              >
                View Details
              </button>
            </div>
          </div>
        </section>
        {/* ------------------------------------------------------------------------ */}

        {/* -------------------- Mechanic Highlight -------------------- */}
        <section
          style={styles.highlightedWrap}
          aria-labelledby="mechanic-title"
        >
          {/* Left: Image */}
          <div>
            <img
              src={mechanicImg}
              alt="Bus Mechanic Support"
              style={styles.highlightedImage}
              loading="lazy"
            />
          </div>

          {/* Right: Content */}
          <div>
            <span style={styles.highlightedBadge}>Mechanic Support</span>
            <h2 id="mechanic-title" style={styles.highlightedTitle}>
              On-Road Bus Mechanic Support
            </h2>
            <p style={styles.highlightedSub}>
              Rapid roadside help to reduce downtime and keep routes on time.
            </p>
            <p style={{ marginTop: 14, color: "#374151", lineHeight: 1.65 }}>
              Certified mechanics on standby for breakdowns, diagnostics, and
              quick fixes. We coordinate towing, parts, and get you back on the
              road fast.
            </p>

            <div style={styles.highlightedActions}>
              
              <button
                style={styles.ghostBtn}
                onClick={() =>
                  setSelectedService({ id: "g4", title: "Roadside Assistance" })
                }
              >
                View Details
              </button>
            </div>
          </div>
        </section>
        {/* ---------------------------------------------------------------- */}

        {/* --------------------- Driver Highlight --------------------- */}
        <section style={styles.highlightedWrap} aria-labelledby="driver-title">
          {/* Left: Image */}
          <div>
            <img
              src={driverImg}
              alt="Professional Driver Support"
              style={styles.highlightedImage}
              loading="lazy"
            />
          </div>

          {/* Right: Content */}
          <div>
            <span style={styles.highlightedBadge}>Driver Support</span>
            <h2 id="driver-title" style={styles.highlightedTitle}>
              Professional & Replacement Driver Support
            </h2>
            <p style={styles.highlightedSub}>
              Vetted, trained drivers available for shifts, emergencies, and
              replacements.
            </p>
            <p style={{ marginTop: 14, color: "#374151", lineHeight: 1.65 }}>
              We manage confirmations, shift assignments, and urgent coverage so
              your services never stop. Skill checks, safety protocols, and
              customer-first training included.
            </p>

            <div style={styles.highlightedActions}>
              
              <button
                style={styles.ghostBtn}
                onClick={() =>
                  setSelectedService({ id: "s3", title: "Driver Confirmation" })
                }
              >
                View Details
              </button>
            </div>
          </div>
        </section>
        {/* ---------------------------------------------------------------- */}

        {/* ------------------- Namastey Service Highlight ------------------- */}
        <section
          style={styles.highlightedWrap}
          aria-labelledby="namastey-title"
        >
          {/* Left: Image */}
          <div>
            <img
              src={namstey}
              alt="Namastey Service (Welcome Assistants)"
              style={{
                ...styles.highlightedImage,
                objectFit: "contain",
                width: "100%",
                height: "auto",
              }}
              loading="lazy"
            />
          </div>
          {/* Right: Content */}
          <div>
            <span style={styles.highlightedBadge}>Namastey Service</span>
            <h2 id="namastey-title" style={styles.highlightedTitle}>
              Namastey Service (Welcome Assistants)
            </h2>
            <p style={styles.highlightedSub}>
              A warm, professional welcome that sets the tone for a great
              journey.
            </p>
            <p style={{ marginTop: 14, color: "#374151", lineHeight: 1.65 }}>
              Our welcome assistants greet passengers at boarding points, help
              with luggage, guide seating, and ensure a smooth start to the
              trip—boosting satisfaction and your premium brand image.
            </p>

            <div style={styles.highlightedActions}>
              
              <button
                style={styles.ghostBtn}
                onClick={() =>
                  setSelectedService({
                    id: "p3",
                    title: "Namastey Service (Welcome Assistants)",
                  })
                }
              >
                View Details
              </button>
            </div>
          </div>
        </section>

        {/* Sponsors slider */}
        <section
          aria-labelledby="partners-title"
          style={partnerStyles.wrap}
          onMouseEnter={() => setTrackHover(true)}
          onMouseLeave={() => setTrackHover(false)}
        >
          <style>{`
            @keyframes partners-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .partners-track:hover {
              animation-play-state: paused;
              background: rgba(238, 242, 255, 0.6);
            }
            .partner-item:hover {
              transform: translateY(-3px);
              background: #eef2ff;
              box-shadow: 0 6px 16px rgba(0,0,0,0.08);
            }
            .partner-item img {
              filter: grayscale(100%);
              transition: filter .25s ease, transform .25s ease;
            }
            .partner-item:hover img {
              filter: none;
              transform: scale(1.05);
            }
            @media (max-width: 640px) {
              .partner-name { display: none; }
            }
          `}</style>

          <div style={partnerStyles.headingRow}>
            <div>
              <h2 id="partners-title" style={partnerStyles.hTitle}>
                Our Partners & Sponsors
              </h2>
              <p style={partnerStyles.hSub}>
                Premium Local Advertisers featured on our network
              </p>
            </div>
          </div>

          <div
            style={partnerStyles.viewport}
            aria-label="Premium Local Advertisers carousel"
          >
            <div
              className="partners-track"
              style={{ ...partnerStyles.track, width: "200%" }}
              role="list"
              aria-live="polite"
            >
              {[...localAdvertisers, ...localAdvertisers].map((p, idx) => (
                <a
                  key={`${p.name}-${idx}`}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  role="listitem"
                  style={{ textDecoration: "none" }}
                  aria-label={`Visit ${p.name}`}
                >
                  <div className="partner-item" style={partnerStyles.item}>
                    <img
                      src={p.logo}
                      alt={`${p.name} logo`}
                      style={partnerStyles.logo}
                      loading="lazy"
                    />
                    <span className="partner-name" style={partnerStyles.name}>
                      {p.name}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ✅ Enquiry form modal (same page) */}
      {showEnquiry && (
        <div style={styles.modal} onClick={() => setShowEnquiry(false)}>
          <div
            style={{
              ...styles.modalContent,
              maxWidth: "900px",
              width: "95%",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={styles.modalClose}
              onClick={() => setShowEnquiry(false)}
              aria-label="Close enquiry form"
            >
              ×
            </button>

            <EnquiryForm onSuccess={() => setShowEnquiry(false)} />
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default ServicesPanel;
