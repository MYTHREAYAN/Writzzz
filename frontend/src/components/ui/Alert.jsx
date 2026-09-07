const styles = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  info: "border-paper-200 bg-paper-100 text-ink-800",
};

export default function Alert({ type = "info", children }) {
  if (!children) return null;

  return (
    <div className={`rounded-lg border px-3 py-2.5 text-sm ${styles[type] || styles.info}`} role="alert">
      {children}
    </div>
  );
}
