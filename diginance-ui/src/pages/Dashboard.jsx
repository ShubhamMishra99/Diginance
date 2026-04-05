import { ArrowDownRight, ArrowUpRight, Sparkles, Wallet } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { useFinance } from '../context/FinanceContext'

const money = (n) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)

export function Dashboard() {
  const {
    summary,
    recent,
    categories,
    insights,
    dashboardLoading,
    dashboardError,
  } = useFinance()

  function insightStyles(type) {
    switch (type) {
      case 'warning':
        return 'border-rose-500/35 bg-rose-500/10 text-rose-100'
      case 'positive':
        return 'border-emerald-500/35 bg-emerald-500/10 text-emerald-100'
      case 'info':
        return 'border-sky-500/35 bg-sky-500/10 text-sky-100'
      default:
        return 'border-white/10 bg-slate-900/40 text-slate-300'
    }
  }

  const income = summary?.totalIncome ?? 0
  const expense = summary?.totalExpense ?? 0
  const net = summary?.netBalance ?? 0

  const items = [
    {
      label: 'Total income',
      value: income,
      icon: ArrowUpRight,
      accent: 'text-emerald-400',
      sub: 'From your ledger (API)',
    },
    {
      label: 'Total expense',
      value: expense,
      icon: ArrowDownRight,
      accent: 'text-rose-400',
      sub: 'From your ledger (API)',
    },
    {
      label: 'Net balance',
      value: net,
      icon: Wallet,
      accent: net >= 0 ? 'text-sky-400' : 'text-amber-400',
      sub: 'Income minus expenses',
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Overview
        </h1>
        <p className="mt-2 max-w-xl text-slate-400">
          Totals and recent activity are loaded from{' '}
          <span className="text-slate-300">GET /api/dashboard</span> on your
          backend.
        </p>
      </div>

      {dashboardError ? (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {dashboardError}
        </p>
      ) : null}

      {insights?.messages?.length ? (
        <div>
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-white">
            <Sparkles className="h-5 w-5 text-violet-400" />
            Smart insights
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {insights.messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed transition-all duration-300 hover:translate-y-[-2px] ${insightStyles(m.type)}`}
              >
                {m.text}
              </div>
            ))}
          </div>
        </div>
      ) : dashboardLoading && !insights ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((k) => (
            <div
              key={k}
              className="h-20 animate-pulse rounded-2xl bg-slate-800/50"
            />
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ label, value, icon: Icon, accent, sub }) => (
          <Card key={label} variant="stat">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  {label}
                </p>
                <p className="mt-3 font-display text-3xl font-bold tabular-nums text-white sm:text-4xl">
                  {dashboardLoading && summary === null ? (
                    <span className="inline-block h-9 w-28 animate-pulse rounded-lg bg-slate-700/50 sm:h-10" />
                  ) : (
                    money(value)
                  )}
                </p>
                <p className="mt-2 text-sm text-slate-500">{sub}</p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ${accent}`}
              >
                <Icon className="h-6 w-6" strokeWidth={2} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-lg font-semibold text-white">
            Quick pulse
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Your net position is{' '}
            <span
              className={
                net >= 0
                  ? 'font-medium text-emerald-400'
                  : 'font-medium text-rose-400'
              }
            >
              {dashboardLoading && summary === null ? '…' : money(net)}
            </span>
            . Use <span className="text-slate-300">Records</span> to add or
            filter lines, and <span className="text-slate-300">Analytics</span>{' '}
            for monthly trends from the API.
          </p>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold text-white">
            Recent activity
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Last 5 by <code className="text-slate-400">createdAt</code> —{' '}
            <span className="text-slate-400">/api/dashboard/recent</span>
          </p>
          <ul className="mt-4 space-y-3">
            {dashboardLoading && recent.length === 0 ? (
              <li className="text-sm text-slate-500">Loading…</li>
            ) : recent.length === 0 ? (
              <li className="text-sm text-slate-500">No transactions yet.</li>
            ) : (
              recent.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-3 border-b border-white/5 pb-3 text-sm last:border-0 last:pb-0"
                >
                  <span className="truncate text-slate-300">{t.description}</span>
                  <span
                    className={
                      t.type === 'income'
                        ? 'shrink-0 tabular-nums text-emerald-400'
                        : 'shrink-0 tabular-nums text-rose-300'
                    }
                  >
                    {t.type === 'income' ? '+' : '−'}
                    {money(t.amount)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      {categories.length > 0 ? (
        <Card>
          <h2 className="font-display text-lg font-semibold text-white">
            By category
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            <span className="text-slate-400">/api/dashboard/category</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <div
                key={c.category}
                className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2 text-xs"
              >
                <span className="font-medium text-white">{c.category}</span>
                <span className="mt-1 block text-slate-500">
                  <span className="text-emerald-400/90">
                    +{money(c.income ?? 0)}
                  </span>
                  <span className="mx-1 text-slate-600">·</span>
                  <span className="text-rose-300/90">
                    −{money(c.expense ?? 0)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  )
}
