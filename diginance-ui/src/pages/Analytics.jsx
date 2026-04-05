import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../components/ui/Card'
import { useFinance } from '../context/FinanceContext'

const money = (n) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md">
      <p className="mb-1 font-medium text-slate-300">{label}</p>
      {payload.map((p) => (
        <p
          key={p.dataKey}
          className="tabular-nums"
          style={{ color: p.color }}
        >
          {p.name}: {money(p.value)}
        </p>
      ))}
    </div>
  )
}

export function Analytics() {
  const {
    chartData,
    summary,
    dashboardLoading,
    dashboardError,
  } = useFinance()

  const net = summary?.netBalance ?? 0
  const data = chartData

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white">
          Analytics
        </h1>
        <p className="mt-2 text-slate-400">
          Monthly income vs expense from{' '}
          <span className="text-slate-300">/api/dashboard/trends</span>.
        </p>
      </div>

      {dashboardError ? (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {dashboardError}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Net balance
          </p>
          <p className="mt-3 font-display text-2xl font-bold text-white">
            {dashboardLoading && summary === null ? (
              <span className="inline-block h-8 w-36 animate-pulse rounded-lg bg-slate-700/50" />
            ) : (
              money(net)
            )}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            From <span className="text-slate-400">/api/dashboard/summary</span>
          </p>
        </Card>
        <Card className="lg:col-span-2" glow>
          <h2 className="mb-6 font-display text-lg font-semibold text-white">
            Trends
          </h2>
          <div className="h-[320px] w-full min-w-0">
            {dashboardLoading && data.length === 0 ? (
              <p className="flex h-full items-center justify-center text-slate-500">
                Loading chart…
              </p>
            ) : data.length === 0 ? (
              <p className="flex h-full items-center justify-center text-slate-500">
                Add transactions to see a chart.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c084fc" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#c084fc" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,163,184,0.15)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
                    }
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fill="url(#incomeFill)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Expense"
                    stroke="#c084fc"
                    strokeWidth={2}
                    fill="url(#expenseFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
              Income
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_8px_#c084fc]" />
              Expense
            </span>
          </div>
        </Card>
      </div>
    </div>
  )
}
