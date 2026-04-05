import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { api } from '../lib/api'
import { categories } from '../data/mockData'

const money = (n) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)

function currentMonthLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function Budgets() {
  const [month, setMonth] = useState(currentMonthLocal)
  const [budgets, setBudgets] = useState([])
  const [status, setStatus] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formCategory, setFormCategory] = useState('Software')
  const [formMonth, setFormMonth] = useState(currentMonthLocal)
  const [formLimit, setFormLimit] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [bRes, sRes] = await Promise.all([
        api(`/api/budgets?month=${encodeURIComponent(month)}`),
        api(`/api/budgets/status?month=${encodeURIComponent(month)}`),
      ])
      setBudgets(bRes.budgets || [])
      setStatus(sRes.status || [])
    } catch (e) {
      setError(e.message || 'Failed to load budgets')
      setBudgets([])
      setStatus([])
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setEditing(null)
    setFormCategory('Software')
    setFormMonth(month)
    setFormLimit('')
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(b) {
    setEditing(b)
    setFormCategory(b.category)
    setFormMonth(b.month)
    setFormLimit(String(b.limit))
    setFormError('')
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setFormError('')
    const lim = Number(formLimit)
    if (Number.isNaN(lim) || lim < 0) {
      setFormError('Enter a valid limit')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await api(`/api/budgets/${editing.id}`, {
          method: 'PUT',
          body: {
            category: formCategory,
            month: formMonth,
            limit: lim,
          },
        })
      } else {
        await api('/api/budgets', {
          method: 'POST',
          body: {
            category: formCategory,
            month: formMonth,
            limit: lim,
          },
        })
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setFormError(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this budget?')) return
    try {
      await api(`/api/budgets/${id}`, { method: 'DELETE' })
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const catOptions = categories.filter((c) => c !== 'All')

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">
            Budgets
          </h1>
          <p className="mt-2 text-slate-400">
            Monthly caps by category with spend tracking from your expenses.
          </p>
        </div>
        <Button type="button" onClick={openCreate} className="shrink-0">
          <Plus className="h-4 w-4" />
          New budget
        </Button>
      </div>

      <Card className="p-4 sm:p-6">
        <label className="mb-2 block text-left text-xs font-medium uppercase tracking-wider text-slate-400">
          View month
        </label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full max-w-xs rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20"
        />
      </Card>

      {error ? (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <Card className="py-16 text-center text-slate-500">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
            Loading budgets…
          </span>
        </Card>
      ) : status.length === 0 ? (
        <Card className="py-16 text-center transition-all duration-300">
          <p className="font-medium text-slate-400">No budgets for this month</p>
          <p className="mt-2 text-sm text-slate-600">
            Create a budget to track spending limits by category.
          </p>
          <Button type="button" className="mt-6" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Create budget
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {status.map((s) => {
            const pct =
              s.limit > 0 ? Math.min(100, Math.round((s.spent / s.limit) * 100)) : 0
            const barWidth =
              s.limit > 0 ? Math.min(100, (s.spent / s.limit) * 100) : 0
            const over = s.spent > s.limit
            return (
              <Card
                key={s.id}
                className="transition-all duration-300 hover:border-white/15"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold text-white">
                      {s.category}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {s.month} · Limit {money(s.limit)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const b = budgets.find((x) => x.id === s.id)
                        if (b) openEdit(b)
                      }}
                      className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-sky-400"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-rose-400"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-2 flex justify-between text-xs text-slate-400">
                    <span>Spent {money(s.spent)}</span>
                    <span className={over ? 'text-rose-400' : 'text-emerald-400/90'}>
                      {over ? 'Over limit' : `${money(s.remaining)} left`}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        over
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                          : 'bg-gradient-to-r from-sky-500 to-violet-500'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-600">{pct}% of budget used</p>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editing ? 'Edit budget' : 'New budget'}
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" form="budget-form" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <form id="budget-form" onSubmit={handleSave} className="space-y-4">
          {formError ? (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {formError}
            </p>
          ) : null}
          <Select
            label="Category"
            value={formCategory}
            onChange={(e) => setFormCategory(e.target.value)}
          >
            {catOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <div>
            <label className="mb-2 block text-left text-xs font-medium uppercase tracking-wider text-slate-400">
              Month
            </label>
            <input
              type="month"
              value={formMonth}
              onChange={(e) => setFormMonth(e.target.value)}
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
          <Input
            label="Monthly limit"
            name="limit"
            type="number"
            min="0"
            step="0.01"
            value={formLimit}
            onChange={(e) => setFormLimit(e.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  )
}
