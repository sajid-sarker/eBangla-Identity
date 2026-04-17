import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import axios from "axios";
import { API_BASE_URL } from "./config/env";

import Navbar from "./components/common/Navbar";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import MedicalRecords from "./pages/MedicalRecords";
import PoliceRecords from "./pages/PoliceRecords";
import TaxRecords from "./pages/TaxRecords";
import EducationRecords from "./pages/EducationRecords";
import Report from "./pages/ReportPage";
import ScorePage from "./pages/ScorePage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import { AdminMedical } from "./pages/admin/AdminModules";
import AdminTax from "./pages/admin/AdminTax"; // Imported as a standalone file
import AdminPolice from "./pages/admin/AdminPolice"; // Imported as a standalone file
import AdminCitizenPoliceProfile from "./pages/admin/AdminCitizenPoliceProfile";
import AdminEducation from "./pages/admin/AdminEducation";
import { AdminProvider } from "./context/AdminContext";

// Configure axios defaults
axios.defaults.withCredentials = true;

const ProtectedRoute = ({
  children,
  user,
  loading,
  requireCompleteProfile = true,
  requireAdmin = false,
  allowedAdminRoles = [],
}) => {
  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin) {
    if (!user.isAdmin) {
      return <Navigate to="/" replace />;
    }
    // Strict RBAC: Check if the admin's role is allowed for this route
    if (allowedAdminRoles.length > 0 && !allowedAdminRoles.includes(user.role)) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  if (!user.isAdmin && requireCompleteProfile && !user.isProfileComplete) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#05339C",
      light: "#3a5fc4",
      dark: "#02206a",
      contrastText: "#ffffff",
    },
    background: {
      default: "#ffffff",
      paper: "#f5f8ff",
    },
    text: {
      primary: "#0d1b3e",
      secondary: "#4a5a80",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/user/me`);
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-container">
        <Navbar user={user} setUser={setUser} avatarTimestamp={avatarTimestamp} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute
                user={user}
                loading={loading}
                requireCompleteProfile={false}
              >
                {user?.isAdmin ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <Profile user={user} setUser={setUser} setAvatarTimestamp={setAvatarTimestamp} />
                )}
              </ProtectedRoute>
            }
          />

          <Route
            path="/medical"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <MedicalRecords user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/police"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <PoliceRecords user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tax"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <TaxRecords user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/education"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <EducationRecords user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <Navigate to="/profile" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/score"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <ScorePage user={user} />
              </ProtectedRoute>
            }

          />
          <Route
            path="/report"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <Report user={user} />
              </ProtectedRoute>
            }

          />


          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <AdminProvider>
                <Routes>
                  <Route
                    path="dashboard"
                    element={
                      <ProtectedRoute user={user} loading={loading} requireAdmin={true}>
                        <AdminDashboard user={user} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="medical"
                    element={
                      <ProtectedRoute user={user} loading={loading} requireAdmin={true} allowedAdminRoles={["medical", "superuser"]}>
                        <AdminMedical user={user} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="police"
                    element={
                      <ProtectedRoute user={user} loading={loading} requireAdmin={true} allowedAdminRoles={["police", "superuser"]}>
                        <AdminPolice user={user} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="police/citizen/:id"
                    element={
                      <ProtectedRoute user={user} loading={loading} requireAdmin={true} allowedAdminRoles={["police", "superuser"]}>
                        <AdminCitizenPoliceProfile user={user} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="tax"
                    element={
                      <ProtectedRoute user={user} loading={loading} requireAdmin={true} allowedAdminRoles={["general", "superuser"]}>
                        <AdminTax user={user} />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="education"
                    element={
                      <ProtectedRoute user={user} loading={loading} requireAdmin={true} allowedAdminRoles={["general", "superuser"]}>
                        <AdminEducation user={user} />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </AdminProvider>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}
export default App;