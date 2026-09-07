import { useNavigate } from "react-router-dom";
import { PenTool, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "../../../components/ui/Button";

export default function HandwritingStatus({ profile }) {
  const navigate = useNavigate();
  const isReady = profile && profile.isTrained;

  return (
    <div className="rounded-xl border border-paper-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between pb-3 border-b border-paper-100">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-terracotta-50 text-terracotta-600">
            <PenTool className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-ink-900">Handwriting Profile</h3>
        </div>

        {isReady ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Ready
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            <AlertCircle className="h-3.5 w-3.5" />
            Action needed
          </span>
        )}
      </div>

      <div className="mt-4">
        {isReady ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-ink-900">
              Your handwriting profile is ready.
            </p>
            <div className="rounded-lg bg-paper-50 p-3 text-xs text-ink-700 border border-paper-100 flex items-center justify-between">
              <span>Display Style:</span>
              <span className="font-semibold text-terracotta-600">
                {profile.styleType || "Running Letter"}
              </span>
            </div>
            <Button
              variant="secondary"
              fullWidth
              size="sm"
              onClick={() => navigate("/handwriting")}
            >
              Update Handwriting
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-ink-700 leading-relaxed">
              Your handwriting profile is not ready yet. Set up sample letters to enable custom AI font synthesis.
            </p>
            <Button fullWidth size="sm" onClick={() => navigate("/handwriting")}>
              Set Up Handwriting
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
