import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { APP_ROUTES } from "../../constants/routes";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner label="Checking session" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={APP_ROUTES.profile} replace />;
  }

  return children;
}
