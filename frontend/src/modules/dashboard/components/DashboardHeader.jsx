import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  User as UserIcon,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import WritzzBrandText from "./WritzzBrandText";

export default function DashboardHeader({
  onMenuClick,
  user,
  onLogout,
  searchQuery,
  onSearchChange,
}) {
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sampleNotifications = [
    {
      id: 1,
      title: "Welcome to Writzz!",
      desc: "Get started by uploading study materials or creating your first assignment.",
      time: "Just now",
      icon: Sparkles,
    },
    {
      id: 2,
      title: "Module 01 Authenticated",
      desc: "Your JWT session is securely active.",
      time: "5m ago",
      icon: CheckCircle2,
    },
  ];

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-paper-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Left: Mobile Menu Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu sidebar"
          className="rounded-lg p-2 text-ink-700 hover:bg-paper-100 hover:text-ink-900 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile Brand Title */}
        <div className="lg:hidden">
          <WritzzBrandText size="sm" />
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden sm:relative sm:block sm:w-72 lg:w-96">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-ink-700" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search assignments, subjects, materials..."
            className="w-full rounded-full border border-ink-100 bg-paper-50/70 pl-9 pr-4 py-1.5 text-sm text-ink-800 outline-none transition-all placeholder:text-ink-700 focus:border-terracotta-500 focus:bg-white focus:ring-2 focus:ring-terracotta-500/20"
          />
        </div>
      </div>

      {/* Right: Notifications & User Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            aria-label="View notifications"
            className="relative rounded-full p-2 text-ink-700 hover:bg-paper-100 hover:text-ink-900 transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terracotta-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-terracotta-600" />
            </span>
          </button>

          {/* Notifications Popover */}
          {notificationsOpen ? (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-paper-200 bg-white p-4 shadow-xl ring-1 ring-black/5">
              <div className="flex items-center justify-between border-b border-paper-100 pb-2">
                <h4 className="text-sm font-semibold text-ink-900">Notifications</h4>
                <span className="rounded-full bg-terracotta-50 px-2 py-0.5 text-[11px] font-medium text-terracotta-600">
                  {sampleNotifications.length} New
                </span>
              </div>
              <div className="mt-3 space-y-3 max-h-64 overflow-y-auto">
                {sampleNotifications.map((notif) => {
                  const Icon = notif.icon;
                  return (
                    <div key={notif.id} className="flex gap-3 rounded-lg p-2 hover:bg-paper-50 transition-colors">
                      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-terracotta-50 text-terracotta-600">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-ink-900">{notif.title}</p>
                        <p className="text-[11px] text-ink-700 leading-tight">{notif.desc}</p>
                        <span className="mt-1 block text-[10px] text-ink-700">{notif.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            aria-label="User profile menu"
            className="flex items-center gap-2 rounded-full border border-paper-200 bg-white p-1 pr-2.5 shadow-sm hover:border-ink-100 transition-all focus:outline-none focus:ring-2 focus:ring-terracotta-500/20"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-terracotta-500/40"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta-600 text-xs font-bold text-white shadow-sm">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
              </div>
            )}
            <span className="hidden text-xs font-semibold text-ink-800 sm:inline-block max-w-[120px] truncate">
              {user?.fullName?.split(" ")[0] || "Account"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-ink-700" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen ? (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-paper-200 bg-white py-2 shadow-xl ring-1 ring-black/5">
              <div className="border-b border-paper-100 px-4 py-2">
                <p className="truncate text-xs font-semibold text-ink-900">{user?.fullName}</p>
                <p className="truncate text-[11px] text-ink-700">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-ink-800 hover:bg-paper-50"
              >
                <UserIcon className="h-4 w-4 text-ink-700" />
                My Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-ink-800 hover:bg-paper-50"
              >
                <Settings className="h-4 w-4 text-ink-700" />
                Settings
              </Link>

              <div className="border-t border-paper-100 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
