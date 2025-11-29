// src/ProtectedStaffRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedStaffRoute = ({ allowedRole, children }) => {
  const token = localStorage.getItem("token");
  const stored = localStorage.getItem("admin");
  const user = stored ? JSON.parse(stored) : null;

  // ❌ Not logged in -> staff login pe bhej do
  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  const userRole = user.role; // backend se jo mila

  // ❌ Wrong role -> apne role ke dashboard me redirect
  if (userRole !== allowedRole) {
    const role = (userRole || "").toLowerCase();

    const routeMap = {
      admin: "/admin",
      manager: "/manager",
      accountant: "/accountant",
      branchhead: "/branch-head",
      "branch-head": "/branch-head",
      sales: "/sales",
    };

    return <Navigate to={routeMap[role] || "/admin/login"} replace />;
  }

  // ✅ Correct role -> children (dashboard) dikhao
  return children;
};

export default ProtectedStaffRoute;
