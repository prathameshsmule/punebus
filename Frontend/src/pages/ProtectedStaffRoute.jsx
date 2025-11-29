// src/ProtectedStaffRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedStaffRoute = ({ allowedRole, children }) => {
  const token = localStorage.getItem("token");
  const stored = localStorage.getItem("admin");
  const user = stored ? JSON.parse(stored) : null;

  if (!token || !user) {
    return <Navigate to="/admin-login" replace />;
  }

  if (user.role !== allowedRole) {
    // galat role: apne hi dashboard me bhej do
    const role = (user.role || "").toLowerCase();
    const map = {
      admin: "/admin",
      manager: "/manager",
      accountant: "/accountant",
      branchHead: "/branch-head",
      sales: "/sales",
    };
    return <Navigate to={map[role] || "/admin-login"} replace />;
  }

  return children;
};

export default ProtectedStaffRoute;
