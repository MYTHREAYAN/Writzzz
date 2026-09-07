import { CheckCircle2, Circle } from "lucide-react";

export default function StyleCard({ id, title, description, samplePreview, isSelected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(id)}
      className={`group relative cursor-pointer rounded-xl border p-5 transition-all duration-200 ${
        isSelected
          ? "border-terracotta-600 bg-terracotta-50/20 shadow-md ring-2 ring-terracotta-500/20"
          : "border-paper-200 bg-white hover:border-ink-100 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between">
        <h3 className="text-base font-semibold text-ink-900 group-hover:text-terracotta-600 transition-colors">
          {title}
        </h3>
        {isSelected ? (
          <CheckCircle2 className="h-5 w-5 text-terracotta-600 flex-shrink-0" />
        ) : (
          <Circle className="h-5 w-5 text-ink-100 flex-shrink-0 group-hover:text-ink-700 transition-colors" />
        )}
      </div>

      <p className="mt-1.5 text-xs text-ink-700 leading-relaxed">{description}</p>

      {/* Visual Sample Representation */}
      <div className="mt-4 overflow-hidden rounded-lg border border-paper-200 bg-paper-50 p-3 text-center">
        <p
          className={`text-lg transition-all ${
            id === "Running Letter"
              ? "font-serif italic tracking-wide text-ink-900"
              : "font-sans font-medium tracking-widest text-ink-900 uppercase"
          }`}
        >
          {samplePreview || "Writzz Handwriting Profile"}
        </p>
        <span className="mt-1 block text-[10px] text-ink-700">Visual style representation</span>
      </div>
    </div>
  );
}
