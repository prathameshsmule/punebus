import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import EnquiryForm from "./pages/EnquiryForm";
import ManagerDashboard from "./pages/ManagerDashboard";
import AccountantDashboard from "./pages/AccountantDashboard";
import BranchDashboard from "./pages/BranchDashboard";
import SalesDashboard from "./pages/SalesDashboard";
const App = () => (
  <div>
    <Navbar />
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />

        {/* ✅ Registration URL */}
        <Route path="/register" element={<Register />} />

        {/* ✅ Login */}
        <Route path="/login" element={<Login />} />

        {/* ✅ Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* ✅ Enquiry Form Route */}
        <Route path="/enquiry" element={<EnquiryForm />} />
        
        <Route path="/accountant" element={<AccountantDashboard />} />
        <Route path="/manager" element={<ManagerDashboard />} />
        
      <Route path="/branch-head" element={<BranchDashboard />} />
      <Route path="/sales" element={<SalesDashboard />} />
      </Routes>
    </main>
  </div>
);

export default App;
