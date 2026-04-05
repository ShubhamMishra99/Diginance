export function Select({ label, id, className = '', children, ...props }) {
  const selectId = id || props.name
  return (
    <div className={`w-full ${className}`}>
      {label ? (
        <label
          htmlFor={selectId}
          className="mb-2 block text-left text-xs font-medium uppercase tracking-wider text-slate-400"
        >
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className="w-full cursor-pointer rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition-all focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20"
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
