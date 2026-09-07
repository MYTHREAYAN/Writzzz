import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sparkles, ArrowLeft, Construction } from "lucide-react";
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardHeader from "../components/DashboardHeader";
import { useAuth } from "../../../context/AuthContext";
import Button from "../../../components/ui/Button";
import { APP_ROUTES } from "../../../constants/routes";

export default function PlaceholderPage({ title, moduleNumber, description }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  async function handleLogout() {
    await logout();
    navigate(APP_ROUTES.login, { replace: true });
  }

  return (
    <div className="min-h-screen bg-paper-50/60 text-ink-800 antialiased font-sans">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      <div className="flex min-h-screen flex-col lg:pl-64">
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8 max-w-4xl w-full mx-auto flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-terracotta-50 text-terracotta-600 shadow-sm ring-1 ring-terracotta-500/20">
            <Construction className="h-8 w-8" />
          </div>

          <span className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-terracotta-500/30 bg-terracotta-50 px-3 py-1 text-xs font-semibold text-terracotta-600">
            <Sparkles className="h-3.5 w-3.5" />
            Writzz {moduleNumber ? `Module ${moduleNumber}` : "Upcoming Feature"}
          </span>

          <h1 className="mt-4 font-display text-3xl font-bold text-ink-900 sm:text-4xl">
            {title || "Feature In Development"}
          </h1>

          <p className="mt-3 max-w-md text-sm text-ink-700 leading-relaxed">
            {description ||
              "This module will be fully integrated in the upcoming module implementation. Your workspace is configured and ready."}
          </p>

          <div className="mt-8 flex gap-3">
            <Button onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4 inline" />
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
