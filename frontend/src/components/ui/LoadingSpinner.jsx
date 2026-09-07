export default function LoadingSpinner({ label = "Loading" }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-ink-700" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-terracotta-500 border-t-transparent" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
