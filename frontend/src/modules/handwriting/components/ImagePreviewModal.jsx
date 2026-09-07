import { useEffect } from "react";
import { X, HardDrive, Calendar } from "lucide-react";

export default function ImagePreviewModal({ sample, isOpen, onClose }) {
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

  function formatBytes(bytes) {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-900/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Lightbox Container */}
      <div className="relative z-10 max-h-[90vh] max-w-4xl w-full flex flex-col rounded-2xl bg-ink-900 border border-ink-800 shadow-2xl overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-ink-800 px-6 py-4 text-white">
          <div>
            <h3 className="text-sm font-semibold truncate max-w-md">
              {sample.originalName || "Handwriting Sample Preview"}
            </h3>
            <p className="text-[11px] text-ink-100 mt-0.5">
              {formatBytes(sample.size)} · {sample.mimeType}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close image preview"
            className="rounded-lg p-1.5 text-ink-100 hover:bg-ink-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Image Frame */}
        <div className="flex flex-1 items-center justify-center p-4 overflow-auto max-h-[75vh]">
          <img
            src={sample.url}
            alt={sample.originalName || "Handwriting Sample"}
            className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
