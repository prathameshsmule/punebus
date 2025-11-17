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
      </Routes>
    </main>
  </div>
);

export default App;
