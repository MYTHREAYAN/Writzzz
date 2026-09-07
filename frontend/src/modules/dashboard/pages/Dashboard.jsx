import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { getDashboard } from "../services/dashboardService";
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardHeader from "../components/DashboardHeader";
import WelcomeSection from "../components/WelcomeSection";
import QuickActions from "../components/QuickActions";
import StatsCards from "../components/StatsCards";
import RecentAssignments from "../components/RecentAssignments";
import DraftAssignments from "../components/DraftAssignments";
import HandwritingStatus from "../components/HandwritingStatus";
import StudyMaterialsStatus from "../components/StudyMaterialsStatus";
import LoadingSkeleton from "../components/LoadingSkeleton";
import Alert from "../../../components/ui/Alert";
import Button from "../../../components/ui/Button";
import { APP_ROUTES } from "../../../constants/routes";
import { RefreshCw } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getDashboard();
      setDashboardData(result.data);
    } catch (err) {
      if (err.status === 401) {
        // Session expired or invalid
        await logout();
        navigate(APP_ROUTES.login, { replace: true });
        return;
      }
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      navigate(APP_ROUTES.login, { replace: true });
    } catch (err) {
      setError(err.message || "Logout failed");
    } finally {
      setLoggingOut(false);
    }
  }

  // Filter assignments based on search input if active
  const filteredRecentAssignments = (dashboardData?.recentAssignments || []).filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      (item.subject && item.subject.toLowerCase().includes(query)) ||
      (item.status && item.status.toLowerCase().includes(query))
    );
  });

  const filteredDraftAssignments = (dashboardData?.draftAssignments || []).filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      (item.subject && item.subject.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-paper-50/60 text-ink-800 antialiased font-sans">
      {/* Sidebar Navigation */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
        loggingOut={loggingOut}
      />

      {/* Main Content Area (Padded on large screens to accommodate fixed sidebar) */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Dashboard Sticky Header */}
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dashboard Main Content Body */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="mx-auto my-12 max-w-md rounded-2xl border border-paper-200 bg-white p-8 text-center shadow-page">
              <Alert type="error">{error}</Alert>
              <p className="mt-4 text-sm text-ink-700">
                Unable to load dashboard data. Please check your backend server or network connection.
              </p>
              <div className="mt-6 flex justify-center">
                <Button onClick={fetchData}>
                  <RefreshCw className="mr-2 h-4 w-4 inline" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Welcome Banner */}
              <WelcomeSection user={user || dashboardData?.user} />

              {/* Statistics Overview Grid */}
              <StatsCards statistics={dashboardData?.statistics} />

              {/* Quick Actions Grid */}
              <QuickActions />

              {/* Assignments & Status Grid */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Left 2 Columns: Recent & Draft Assignments */}
                <div className="space-y-8 lg:col-span-2">
                  <RecentAssignments assignments={filteredRecentAssignments} />
                  <DraftAssignments drafts={filteredDraftAssignments} />
                </div>

                {/* Right Column: Handwriting & Study Material Status Cards */}
                <div className="space-y-8">
                  <HandwritingStatus profile={dashboardData?.handwritingProfile} />
                  <StudyMaterialsStatus studyMaterials={dashboardData?.studyMaterials} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
