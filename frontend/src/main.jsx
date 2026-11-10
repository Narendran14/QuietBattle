import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import App from "./App.jsx";
import AdminLogin from "./pages/admin/adminlogin.jsx";
import AdminDashboard from "./pages/admin/admindashboard.jsx";
import ManageSeries from "./pages/admin/manageSeries.jsx";
import ManageChapters from "./pages/admin/manageChapters.jsx";
import ManageProducts from "./pages/admin/manageProducts.jsx";
import ManageImages from "./pages/admin/manageImages.jsx";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Existing public website */}
        <Route path="/" element={<App />} />

        {/* Admin pages */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/series" element={<ManageSeries />} />
        <Route path="/admin/chapters" element={<ManageChapters />} />
        <Route path="/admin/products" element={<ManageProducts />} />
        <Route path="/admin/images" element={<ManageImages />} />

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
