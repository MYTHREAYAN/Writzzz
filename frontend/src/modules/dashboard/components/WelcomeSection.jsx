import { useNavigate } from "react-router-dom";
import { PlusCircle, Upload, Sparkles } from "lucide-react";
import Button from "../../../components/ui/Button";

export default function WelcomeSection({ user }) {
  const navigate = useNavigate();
  const firstName = user?.fullName ? user.fullName.split(" ")[0] : "Student";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-paper-200 bg-gradient-to-r from-paper-50 via-white to-paper-100/70 p-6 shadow-sm sm:p-8">
      {/* Decorative accent */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-terracotta-500/5 blur-2xl" />

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-terracotta-500/20 bg-terracotta-50/60 px-3 py-1 text-xs font-semibold text-terracotta-600">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Writzz AI Workspace</span>
        </div>

        <h1 className="mt-3 font-display text-3xl font-bold text-ink-900 sm:text-4xl">
          Welcome back, <span className="text-terracotta-600">{firstName}</span>!
        </h1>

        <p className="mt-2 text-base text-ink-700">
          Create, personalize and manage your assignments with Writzz.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={() => navigate("/assignments/create")}>
            <PlusCircle className="mr-2 h-4 w-4 inline" />
            Create New Assignment
          </Button>

          <Button variant="secondary" onClick={() => navigate("/assignments/create?tab=upload")}>
            <Upload className="mr-2 h-4 w-4 inline text-ink-700" />
            Upload Question
          </Button>
        </div>
      </div>
    </div>
  );
}
