export function Card({
  children,
  className = '',
  variant = 'default',
  glow = false,
}) {
  if (variant === 'stat') {
    return (
      <div
        className={`rounded-2xl bg-gradient-to-br from-sky-500/40 via-violet-500/25 to-fuchsia-500/10 p-px shadow-lg transition-all duration-300 hover:shadow-sky-500/10 ${glow ? 'glow-ring' : ''} ${className}`}
      >
        <div className="h-full rounded-2xl border border-white/5 bg-slate-950/85 p-6 backdrop-blur-sm">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-lg transition-all duration-300 hover:border-sky-500/20 hover:shadow-lg hover:shadow-sky-500/5 ${glow ? 'glow-ring' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
