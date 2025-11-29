import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";

import ProtectedStaffRoute from "./ProtectedStaffRoute";

import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import AccountantDashboard from "./pages/AccountantDashboard";
import BranchDashboard from "./pages/BranchDashboard";
import SalesDashboard from "./pages/SalesDashboard";

import EnquiryForm from "./pages/EnquiryForm";

const App = () => (
  <div>
    <Navbar />
    <main>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* ADMIN LOGIN PAGE */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* PROTECTED ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            <ProtectedStaffRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedStaffRoute>
          }
        />

        {/* ENQUIRY PAGE */}
        <Route path="/enquiry" element={<EnquiryForm />} />

        {/* MANAGER */}
        <Route
          path="/manager"
          element={
            <ProtectedStaffRoute allowedRole="manager">
              <ManagerDashboard />
            </ProtectedStaffRoute>
          }
        />

        {/* ACCOUNTANT */}
        <Route
          path="/accountant"
          element={
            <ProtectedStaffRoute allowedRole="accountant">
              <AccountantDashboard />
            </ProtectedStaffRoute>
          }
        />

        {/* BRANCH HEAD */}
        <Route
          path="/branch-head"
          element={
            <ProtectedStaffRoute allowedRole="branchHead">
              <BranchDashboard />
            </ProtectedStaffRoute>
          }
        />

        {/* SALES */}
        <Route
          path="/sales"
          element={
            <ProtectedStaffRoute allowedRole="sales">
              <SalesDashboard />
            </ProtectedStaffRoute>
          }
        />
      </Routes>
    </main>
  </div>
);

export default App;
