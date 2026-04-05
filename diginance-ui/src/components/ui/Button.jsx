export function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-45'
  const variants = {
    primary:
      'bg-gradient-to-r from-sky-500 to-violet-500 text-white shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-violet-400 hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98]',
    secondary:
      'border border-white/15 bg-white/5 text-slate-100 hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-white',
    ghost:
      'text-slate-300 hover:bg-white/5 hover:text-white',
    danger:
      'border border-rose-500/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
