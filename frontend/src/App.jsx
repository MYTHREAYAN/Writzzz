import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import Dashboard from "./modules/dashboard/pages/Dashboard";
import HandwritingProfile from "./modules/handwriting/pages/HandwritingProfile";
import PlaceholderPage from "./modules/dashboard/pages/PlaceholderPage";
import { APP_ROUTES } from "./constants/routes";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={APP_ROUTES.dashboard} replace />} />
      <Route
        path={APP_ROUTES.login}
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path={APP_ROUTES.register}
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path={APP_ROUTES.forgotPassword}
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path={APP_ROUTES.resetPassword}
        element={
          <PublicOnlyRoute>
            <ResetPasswordPage />
          </PublicOnlyRoute>
        }
      />

      {/* Module 02 — Main Protected Dashboard Route */}
      <Route
        path={APP_ROUTES.dashboard}
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Module 03 — Handwriting Profile Route */}
      <Route
        path={APP_ROUTES.handwriting}
        element={
          <ProtectedRoute>
            <HandwritingProfile />
          </ProtectedRoute>
        }
      />

      {/* Module 01 — User Profile Page */}
      <Route
        path={APP_ROUTES.profile}
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Placeholders for Future Modules */}
      <Route
        path={APP_ROUTES.createAssignment}
        element={
          <ProtectedRoute>
            <PlaceholderPage
              title="Create Assignment"
              moduleNumber="04 & 05"
              description="Question processing and assignment planner will allow you to generate custom handwritten assignments."
            />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.assignments}
        element={
          <ProtectedRoute>
            <PlaceholderPage
              title="My Assignments"
              moduleNumber="10"
              description="View, edit, and organize all your saved and completed handwritten assignments."
            />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.materials}
        element={
          <ProtectedRoute>
            <PlaceholderPage
              title="Study Materials"
              moduleNumber="07"
              description="Upload course notes, textbooks, and PDF documents for intelligent Gemini AI context extraction."
            />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.research}
        element={
          <ProtectedRoute>
            <PlaceholderPage
              title="Web Research"
              moduleNumber="08"
              description="Automated web research tool to supplement assignment answers with citations."
            />
          </ProtectedRoute>
        }
      />
      <Route
        path={APP_ROUTES.settings}
        element={
          <ProtectedRoute>
            <PlaceholderPage
              title="Account & Workspace Settings"
              moduleNumber="Preferences"
              description="Configure theme, default PDF export format, and account preferences."
            />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to={APP_ROUTES.dashboard} replace />} />
    </Routes>
  );
}
