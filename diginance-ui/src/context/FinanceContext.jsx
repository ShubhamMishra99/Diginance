import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { api, buildTransactionQueryParams } from '../lib/api'
import { useAuth } from './AuthContext'

const FinanceContext = createContext(null)

export function FinanceProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const txFiltersRef = useRef({})

  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState([])
  const [recent, setRecent] = useState([])
  const [categories, setCategories] = useState([])
  const [insights, setInsights] = useState(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState(null)

  const refreshTransactions = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)
    txFiltersRef.current = { ...filters }
    try {
      const params = buildTransactionQueryParams(filters)
      const qs = params.toString()
      const url = qs ? `/api/transactions?${qs}` : '/api/transactions'
      const rows = await api(url)
      setTransactions(Array.isArray(rows) ? rows : [])
    } catch (e) {
      setError(e.message || 'Failed to load transactions')
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshDashboard = useCallback(async (options = {}) => {
    const silent = options.silent === true
    if (!silent) {
      setDashboardLoading(true)
    }
    setDashboardError(null)
    try {
      const [sumRes, trendsRes, recentRes, catRes, insRes] = await Promise.all([
        api('/api/dashboard/summary'),
        api('/api/dashboard/trends'),
        api('/api/dashboard/recent'),
        api('/api/dashboard/category'),
        api('/api/insights'),
      ])

      setSummary({
        totalIncome: Number(sumRes.totalIncome) || 0,
        totalExpense: Number(sumRes.totalExpense) || 0,
        netBalance: Number(sumRes.netBalance) || 0,
      })
      setTrends(Array.isArray(trendsRes.trends) ? trendsRes.trends : [])
      setRecent(Array.isArray(recentRes.transactions) ? recentRes.transactions : [])
      setCategories(Array.isArray(catRes.categories) ? catRes.categories : [])
      setInsights(insRes && insRes.success !== false ? insRes : null)
    } catch (e) {
      setDashboardError(e.message || 'Failed to load dashboard')
      if (!silent) {
        setSummary({ totalIncome: 0, totalExpense: 0, netBalance: 0 })
        setTrends([])
        setRecent([])
        setCategories([])
        setInsights(null)
      }
    } finally {
      if (!silent) {
        setDashboardLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setTransactions([])
      setError(null)
      txFiltersRef.current = {}
      setSummary(null)
      setTrends([])
      setRecent([])
      setCategories([])
      setInsights(null)
      setDashboardError(null)
      return
    }

    refreshDashboard()
  }, [isAuthenticated, refreshDashboard])

  const addTransaction = useCallback(
    async (row) => {
      const created = await api('/api/transactions', {
        method: 'POST',
        body: {
          date: row.date,
          description: row.description,
          category: row.category,
          type: row.type,
          amount: Number(row.amount),
        },
      })
      setTransactions((prev) => [created, ...prev])
      await refreshDashboard({ silent: true })
      await refreshTransactions(txFiltersRef.current)
      return created
    },
    [refreshDashboard, refreshTransactions],
  )

  const addRecurringRule = useCallback(
    async (payload) => {
      await api('/api/transactions/recurring', {
        method: 'POST',
        body: payload,
      })
      await refreshDashboard({ silent: true })
      await refreshTransactions(txFiltersRef.current)
    },
    [refreshDashboard, refreshTransactions],
  )

  const chartData = useMemo(() => {
    return trends.map((d) => ({
      month: d.month,
      label: d.month,
      income: d.income ?? 0,
      expense: d.expense ?? 0,
    }))
  }, [trends])

  const value = useMemo(
    () => ({
      transactions,
      addTransaction,
      addRecurringRule,
      loading,
      error,
      refreshTransactions,
      summary,
      trends,
      chartData,
      recent,
      categories,
      insights,
      dashboardLoading,
      dashboardError,
      refreshDashboard,
    }),
    [
      transactions,
      addTransaction,
      addRecurringRule,
      loading,
      error,
      refreshTransactions,
      summary,
      trends,
      chartData,
      recent,
      categories,
      insights,
      dashboardLoading,
      dashboardError,
      refreshDashboard,
    ],
  )

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  )
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider')
  return ctx
}
