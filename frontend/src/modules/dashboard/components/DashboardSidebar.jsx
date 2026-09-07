import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus2,
  FolderKanban,
  PenTool,
  BookOpen,
  Globe,
  Settings,
  LogOut,
  X,
  User as UserIcon,
} from "lucide-react";
import WritzzBrandText from "./WritzzBrandText";

export const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Create Assignment", path: "/assignments/create", icon: FilePlus2 },
  { label: "My Assignments", path: "/assignments", icon: FolderKanban },
  { label: "Handwriting Profile", path: "/handwriting", icon: PenTool },
  { label: "Study Materials", path: "/materials", icon: BookOpen },
  { label: "Web Research", path: "/research", icon: Globe },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function DashboardSidebar({
  isOpen,
  onClose,
  user,
  onLogout,
  loggingOut = false,
}) {
  const location = useLocation();

  // Close drawer on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-ink-900 text-paper-50">
      {/* Top Header & Brand */}
      <div>
        <div className="flex h-16 items-center justify-between border-b border-ink-800 px-6">
          <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2">
            <WritzzBrandText size="sm" className="text-white" />
          </Link>
          {/* Close button for mobile drawer */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-ink-100 hover:bg-ink-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5 px-3 py-6" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-terracotta-600 text-white shadow-md"
                    : "text-ink-100 hover:bg-ink-800 hover:text-white"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                    isActive ? "text-white" : "text-ink-100 group-hover:text-terracotta-500"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile & Logout */}
      <div className="border-t border-ink-800 p-4">
        <div className="flex items-center justify-between rounded-lg bg-ink-800/80 p-3">
          <Link
            to="/profile"
            onClick={onClose}
            className="flex min-w-0 items-center gap-3 hover:opacity-80 transition-opacity"
            title="View Profile"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-terracotta-500/50"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta-600 text-sm font-bold text-white shadow-sm">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                {user?.fullName || "User Account"}
              </p>
              <p className="truncate text-[11px] text-ink-100">{user?.email || ""}</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            aria-label="Logout"
            className="ml-2 rounded-lg p-2 text-ink-100 hover:bg-terracotta-600 hover:text-white transition-colors disabled:opacity-50"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed 64 / 256px wide) */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-ink-800 lg:block lg:fixed lg:inset-y-0 lg:z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay & Drawer */}
      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Slide-out Drawer */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-ink-900 shadow-2xl transition-transform duration-300">
            {sidebarContent}
          </div>
        </div>
      ) : null}
    </>
  );
}
