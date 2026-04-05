export function Input({
  label,
  id,
  className = '',
  error,
  ...props
}) {
  const inputId = id || props.name
  return (
    <div className={`w-full ${className}`}>
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-2 block text-left text-xs font-medium uppercase tracking-wider text-slate-400"
        >
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={`w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 shadow-inner shadow-black/20 outline-none transition-all placeholder:text-slate-500 focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 ${
          error ? 'border-rose-500/50' : ''
        }`}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-left text-xs text-rose-400">{error}</p>
      ) : null}
    </div>
  )
}
