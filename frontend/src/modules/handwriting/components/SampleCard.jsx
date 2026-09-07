import { useRef } from "react";
import { ZoomIn, RefreshCw, Trash2, Calendar, HardDrive } from "lucide-react";

export default function SampleCard({
  sample,
  onZoom,
  onReplace,
  onDelete,
  replacingSampleId,
}) {
  const fileInputRef = useRef(null);
  const isReplacing = replacingSampleId === sample.sampleId;

  function formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-paper-200 bg-white p-3 shadow-sm transition-all hover:border-terracotta-500/40 hover:shadow-md">
      {/* Hidden file input for sample replacement */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onReplace(sample.sampleId, e.target.files[0]);
            e.target.value = "";
          }
        }}
      />

      {/* Image Thumbnail Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-paper-100">
        <img
          src={sample.url}
          alt={sample.originalName || "Handwriting Sample"}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink-900/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onZoom(sample)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-md hover:bg-white transition-all"
            title="Inspect Zoom"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isReplacing}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-md hover:bg-white transition-all disabled:opacity-50"
            title="Replace Sample"
          >
            <RefreshCw className={`h-4 w-4 ${isReplacing ? "animate-spin text-terracotta-600" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(sample)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600/90 text-white shadow-md hover:bg-red-600 transition-all"
            title="Delete Sample"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Card Info */}
      <div className="mt-3 flex items-center justify-between text-xs text-ink-700">
        <span className="truncate max-w-[130px] font-medium text-ink-900" title={sample.originalName}>
          {sample.originalName || "Handwriting Sample"}
        </span>
        <div className="flex items-center gap-2 text-[10px] text-ink-700">
          <span className="inline-flex items-center">
            <HardDrive className="mr-0.5 h-3 w-3" />
            {formatBytes(sample.size)}
          </span>
        </div>
      </div>
    </div>
  );
}
