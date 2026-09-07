import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User as UserIcon } from "lucide-react";
import WritzzBrandText from "../../dashboard/components/WritzzBrandText";

export default function HandwritingProfileHeader({ user }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-paper-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1 text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </button>

        <div className="h-4 w-px bg-paper-200 hidden sm:block" />

        <Link to="/dashboard" className="flex items-center gap-2">
          <WritzzBrandText size="sm" />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-xs font-semibold text-ink-800 sm:inline-block max-w-[150px] truncate">
          {user?.fullName || "Student Account"}
        </span>
        <Link to="/profile">
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
        </Link>
      </div>
    </header>
  );
}
