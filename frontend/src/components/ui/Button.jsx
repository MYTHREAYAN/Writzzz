export default function Button({ children, type = "button", disabled, loading, fullWidth, onClick }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-lg bg-terracotta-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-terracotta-600 disabled:cursor-not-allowed disabled:opacity-60 ${
        fullWidth ? "w-full" : ""
      }`}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
