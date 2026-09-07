import { FileText, FolderPlus } from "lucide-react";
import Button from "../../../components/ui/Button";

/**
 * Reusable empty state UI card with icon, title, description, and action CTA.
 */
export default function EmptyState({
  icon: Icon = FileText,
  title = "No items yet",
  description = "Get started by creating your first item.",
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-100 bg-paper-50/50 px-6 py-8 text-center transition-all ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-100 text-terracotta-600 shadow-sm">
        <Icon className="h-6 w-6" />
      </div>
      <h4 className="mt-3 text-base font-semibold text-ink-900">{title}</h4>
      <p className="mt-1 max-w-sm text-sm text-ink-700">{description}</p>
      {actionLabel && onAction ? (
        <div className="mt-4">
          <Button size="sm" onClick={onAction}>
            <FolderPlus className="mr-1.5 h-4 w-4 inline" />
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
