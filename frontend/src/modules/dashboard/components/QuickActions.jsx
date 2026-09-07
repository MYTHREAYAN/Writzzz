import { useNavigate } from "react-router-dom";
import { FilePlus, UploadCloud, PenTool, BookPlus, ArrowRight } from "lucide-react";

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      id: "create",
      title: "Create New Assignment",
      description: "Start a new personalized assignment.",
      icon: FilePlus,
      color: "bg-amber-500/10 text-amber-700 border-amber-200",
      path: "/assignments/create",
    },
    {
      id: "upload-q",
      title: "Upload Question",
      description: "Upload your assignment questions.",
      icon: UploadCloud,
      color: "bg-blue-500/10 text-blue-700 border-blue-200",
      path: "/assignments/create?action=upload",
    },
    {
      id: "handwriting",
      title: "Handwriting Profile",
      description: "Set up or update your handwriting style.",
      icon: PenTool,
      color: "bg-terracotta-500/10 text-terracotta-700 border-terracotta-200",
      path: "/handwriting",
    },
    {
      id: "materials",
      title: "Upload Study Material",
      description: "Add notes and reference materials.",
      icon: BookPlus,
      color: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
      path: "/materials",
    },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-ink-900">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <div
              key={action.id}
              onClick={() => navigate(action.path)}
              className="group cursor-pointer rounded-xl border border-paper-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-terracotta-500/40 hover:shadow-md"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg border ${action.color} transition-transform group-hover:scale-110`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-ink-900 group-hover:text-terracotta-600 transition-colors">
                {action.title}
              </h3>
              <p className="mt-1 text-xs text-ink-700 leading-relaxed">{action.description}</p>
              <div className="mt-4 flex items-center text-xs font-semibold text-terracotta-600 group-hover:text-terracotta-700">
                <span>Action</span>
                <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
