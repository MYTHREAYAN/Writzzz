import { CheckCircle2, AlertCircle, Sparkles, Layers } from "lucide-react";

export default function ProfileStatus({ status, selectedStyle, sampleCount }) {
  function getStatusConfig() {
    switch (status) {
      case "READY":
        return {
          title: "Your handwriting profile is ready.",
          subtitle: `Style: ${selectedStyle || "Running Letter"} · ${sampleCount} sample(s) uploaded.`,
          badge: "READY",
          badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
          bgGradient: "from-emerald-50/50 to-white border-emerald-200",
        };
      case "INCOMPLETE":
        return {
          title: "Your handwriting profile needs more samples.",
          subtitle: "Upload handwriting sheets containing uppercase, lowercase, numbers, and punctuation.",
          badge: "INCOMPLETE",
          badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
          icon: AlertCircle,
          bgGradient: "from-amber-50/50 to-white border-amber-200",
        };
      case "NOT_CREATED":
      default:
        return {
          title: "Your handwriting profile is not set up yet.",
          subtitle: "Select your preferred handwriting style and upload your sample sheets to get started.",
          badge: "NOT CREATED",
          badgeColor: "bg-ink-100 text-ink-700 border-ink-200",
          icon: Sparkles,
          bgGradient: "from-paper-100/50 to-white border-paper-200",
        };
    }
  }

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-r ${config.bgGradient} p-6 shadow-sm sm:p-8 transition-all`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5">
            <Icon className="h-6 w-6 text-terracotta-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-ink-900">{config.title}</h2>
              <span
                className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.badgeColor}`}
              >
                {config.badge}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-700">{config.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
          <div className="rounded-lg border border-paper-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-800 shadow-sm">
            <Layers className="mr-1.5 h-3.5 w-3.5 inline text-terracotta-600" />
            Style: <span className="font-semibold">{selectedStyle || "Running Letter"}</span>
          </div>
          <div className="rounded-lg border border-paper-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-800 shadow-sm">
            Samples: <span className="font-semibold">{sampleCount} / 10</span>
          </div>
        </div>
      </div>
    </div>
  );
}
