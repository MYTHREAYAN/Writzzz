import { FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default function UploadInstructions() {
  const guidelines = [
    "Write clearly on a plain unlined white sheet using dark ink (black or blue).",
    "Include uppercase letters (A-Z) and lowercase letters (a-z).",
    "Include numbers (0-9) and common punctuation (.,!?;:'\"-()[]{}).",
    "Write natural sentences (e.g. 'The quick brown fox jumps over the lazy dog').",
    "Ensure good lighting and avoid shadows when taking the photo.",
  ];

  return (
    <div className="rounded-xl border border-paper-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2.5 pb-3 border-b border-paper-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-terracotta-50 text-terracotta-600">
          <FileText className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Sample Upload Guidelines</h3>
          <p className="text-[11px] text-ink-700">Follow these tips for optimal handwriting profile calibration.</p>
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-xs text-ink-800">
        {guidelines.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-terracotta-600 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
