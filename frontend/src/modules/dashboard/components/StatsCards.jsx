import { Layers, FileEdit, Clock, CheckCircle2 } from "lucide-react";

export default function StatsCards({ statistics }) {
  const stats = [
    {
      id: "total",
      label: "Total Assignments",
      value: statistics?.totalAssignments ?? 0,
      icon: Layers,
      color: "bg-paper-100 text-ink-800",
    },
    {
      id: "drafts",
      label: "Drafts",
      value: statistics?.draftAssignments ?? 0,
      icon: FileEdit,
      color: "bg-amber-50 text-amber-700",
    },
    {
      id: "inProgress",
      label: "In Progress",
      value: statistics?.inProgressAssignments ?? 0,
      icon: Clock,
      color: "bg-blue-50 text-blue-700",
    },
    {
      id: "completed",
      label: "Completed",
      value: statistics?.completedAssignments ?? 0,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="rounded-xl border border-paper-200 bg-white p-4 shadow-sm transition-all hover:border-ink-100 sm:p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-700">{stat.label}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
              {stat.value}
            </p>
          </div>
        );
      })}
    </section>
  );
}
