import { useNavigate } from "react-router-dom";
import { FileEdit } from "lucide-react";
import EmptyState from "./EmptyState";

export default function DraftAssignments({ drafts = [] }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-paper-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="pb-4 border-b border-paper-100">
        <h3 className="text-base font-semibold text-ink-900">Draft Assignments</h3>
        <p className="text-xs text-ink-700">Resume work on your saved drafts.</p>
      </div>

      <div className="mt-4">
        {drafts.length === 0 ? (
          <EmptyState
            icon={FileEdit}
            title="No drafts available."
            description="All your assignments are either completed or published."
            actionLabel="Create Assignment"
            onAction={() => navigate("/assignments/create")}
          />
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="flex items-center justify-between rounded-lg border border-paper-100 bg-paper-50/50 p-3.5 transition-all hover:bg-paper-50"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <h4 className="truncate text-sm font-semibold text-ink-900">{draft.title}</h4>
                  <p className="mt-0.5 text-xs text-ink-700">{draft.subject}</p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/assignments/create?draftId=${draft.id}`)}
                  className="rounded-lg bg-terracotta-50 px-3 py-1.5 text-xs font-semibold text-terracotta-600 hover:bg-terracotta-600 hover:text-white transition-colors"
                >
                  Continue
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
