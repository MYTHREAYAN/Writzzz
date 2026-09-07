import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { APP_ROUTES } from "../../constants/routes";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner label="Restoring your session" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.login} replace state={{ from: location.pathname }} />;
  }

  return children;
}
