import { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, Plus } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Input } from '../components/ui/Input'
import { AddRecordModal } from '../components/records/AddRecordModal'
import { useFinance } from '../context/FinanceContext'
import { categories } from '../data/mockData'
import { downloadTransactionsCsv } from '../lib/api'

const money = (n) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(n)

export function Transactions() {
  const { transactions, loading, error, refreshTransactions } = useFinance()
  const [modalOpen, setModalOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const filterPayload = useMemo(
    () => ({
      type: typeFilter === 'all' ? '' : typeFilter,
      category: categoryFilter === 'All' ? '' : categoryFilter,
      startDate: from,
      endDate: to,
      minAmount,
      maxAmount,
      sortBy,
      sortOrder,
      search: debouncedSearch,
    }),
    [
      typeFilter,
      categoryFilter,
      from,
      to,
      minAmount,
      maxAmount,
      sortBy,
      sortOrder,
      debouncedSearch,
    ],
  )

  useEffect(() => {
    refreshTransactions(filterPayload)
  }, [filterPayload, refreshTransactions])

  const handleExport = useCallback(async () => {
    setExporting(true)
    try {
      await downloadTransactionsCsv(filterPayload)
    } catch (e) {
      console.error(e)
    } finally {
      setExporting(false)
    }
  }, [filterPayload])

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">
            Records
          </h1>
          <p className="mt-2 text-slate-400">
            Server-side filters, search, and CSV export.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleExport}
            disabled={loading || exporting}
            className="shrink-0"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Export…' : 'Export CSV'}
          </Button>
          <Button
            type="button"
            onClick={() => setModalOpen(true)}
            className="shrink-0"
            disabled={loading}
          >
            <Plus className="h-4 w-4" />
            Add record
          </Button>
        </div>
      </div>

      {error ? (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      <Card className="p-4 transition-all duration-300 sm:p-6">
        <Input
          label="Search description"
          name="search"
          placeholder="Type to search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="From"
            type="date"
            name="from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <Input
            label="To"
            type="date"
            name="to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <Select
            label="Category"
            name="cat"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select
            label="Type"
            name="type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
          <Input
            label="Min amount"
            name="minAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
          />
          <Input
            label="Max amount"
            name="maxAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="Any"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
          <Select
            label="Sort by"
            name="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
          </Select>
          <Select
            label="Order"
            name="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="desc">Newest / highest first</option>
            <option value="asc">Oldest / lowest first</option>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden p-0 transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-slate-950/50 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-slate-500"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-sky-400" />
                      Loading records…
                    </span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-slate-500"
                  >
                    <p className="font-medium text-slate-400">No records found</p>
                    <p className="mt-2 text-xs text-slate-600">
                      Adjust filters or add a transaction.
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-white/5 transition-colors duration-200 hover:bg-white/[0.03]"
                  >
                    <td className="px-6 py-4 tabular-nums text-slate-300">
                      {t.date}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      {t.description}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{t.category}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          t.type === 'income'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-rose-500/15 text-rose-300'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-medium tabular-nums ${
                        t.type === 'income' ? 'text-emerald-400' : 'text-rose-300'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '−'}
                      {money(t.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AddRecordModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
