import { useNavigate } from "react-router-dom";
import { FolderKanban, ArrowUpRight } from "lucide-react";
import EmptyState from "./EmptyState";

export default function RecentAssignments({ assignments = [] }) {
  const navigate = useNavigate();

  function getStatusBadge(status) {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Editing":
      case "Generating":
      case "Planning":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Draft":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  }

  return (
    <div className="rounded-xl border border-paper-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between pb-4 border-b border-paper-100">
        <div>
          <h3 className="text-base font-semibold text-ink-900">Recent Assignments</h3>
          <p className="text-xs text-ink-700">Track and manage your ongoing assignment work.</p>
        </div>
        {assignments.length > 0 ? (
          <button
            type="button"
            onClick={() => navigate("/assignments")}
            className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 inline-flex items-center"
          >
            View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <div className="mt-4">
        {assignments.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No assignments yet."
            description="Create your first assignment and let Writzz generate handwritten pages."
            actionLabel="Create Your First Assignment"
            onAction={() => navigate("/assignments/create")}
          />
        ) : (
          <div className="space-y-3">
            {assignments.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-lg border border-paper-100 bg-paper-50/50 p-4 transition-all hover:bg-paper-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="truncate text-sm font-semibold text-ink-900">{item.title}</h4>
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadge(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-700">Subject: {item.subject}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-24">
                    <div className="flex justify-between text-[10px] text-ink-700">
                      <span>Progress</span>
                      <span>{item.progress}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-ink-100">
                      <div
                        className="h-1.5 rounded-full bg-terracotta-600 transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/assignments/${item.id}`)}
                    className="rounded-lg border border-paper-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-800 shadow-sm hover:border-terracotta-500 hover:text-terracotta-600 transition-colors"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
