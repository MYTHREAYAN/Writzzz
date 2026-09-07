export default function FormInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  autoComplete,
  placeholder,
}) {
  return (
    <label className="block space-y-1.5" htmlFor={id}>
      <span className="text-sm font-medium text-ink-800">{label}</span>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink-800 outline-none transition focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20 ${
          error ? "border-red-400" : "border-ink-100"
        }`}
      />
      {error ? <span className="block text-xs text-red-700">{error}</span> : null}
    </label>
  );
}
