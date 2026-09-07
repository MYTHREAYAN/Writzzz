import { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import Button from "../../../components/ui/Button";

export default function DeleteSampleModal({ sample, isOpen, onClose, onConfirm, deleting }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !sample) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-paper-200 bg-white p-6 shadow-2xl transition-all">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-ink-700 hover:bg-paper-100 hover:text-ink-900"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-ink-900">Delete Sample?</h3>
        </div>

        <p className="mt-3 text-sm text-ink-700 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-ink-900">{sample.originalName || "this handwriting sample"}</span>?
          This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(sample.sampleId)}
            loading={deleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500/20 text-white"
          >
            <Trash2 className="mr-1.5 h-4 w-4 inline" />
            Delete Sample
          </Button>
        </div>
      </div>
    </div>
  );
}
