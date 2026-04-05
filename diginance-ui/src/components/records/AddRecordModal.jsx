import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { categories } from '../../data/mockData'
import { useFinance } from '../../context/FinanceContext'

export function AddRecordModal({ open, onClose }) {
  const { addTransaction, addRecurringRule } = useFinance()
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('Software')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [recurring, setRecurring] = useState(false)
  const [frequency, setFrequency] = useState('monthly')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  function reset() {
    setDescription('')
    setAmount('')
    setType('expense')
    setCategory('Software')
    setDate(new Date().toISOString().slice(0, 10))
    setRecurring(false)
    setFrequency('monthly')
    setFormError('')
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    const n = Number(amount)
    if (!description.trim() || Number.isNaN(n) || n <= 0) return
    setSaving(true)
    try {
      const cat = category === 'All' ? 'Other' : category
      if (recurring) {
        await addRecurringRule({
          description: description.trim(),
          amount: n,
          type,
          category: cat,
          frequency,
          startDate: date,
        })
      } else {
        await addTransaction({
          description: description.trim(),
          amount: n,
          type,
          category: cat,
          date,
        })
      }
      reset()
      onClose()
    } catch (err) {
      setFormError(err.message || 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  const catOptions = categories.filter((c) => c !== 'All')

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={recurring ? 'Add recurring schedule' : 'Add record'}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="add-record-form" disabled={saving}>
            {saving ? 'Saving…' : recurring ? 'Create schedule' : 'Save record'}
          </Button>
        </>
      }
    >
      <form id="add-record-form" onSubmit={handleSubmit} className="space-y-4">
        {formError ? (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {formError}
          </p>
        ) : null}
        <Input
          label="Description"
          name="description"
          placeholder="e.g. SaaS subscription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Input
            label={recurring ? 'First run date' : 'Date'}
            name="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
          <Select
            label="Category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {catOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-left text-sm text-slate-300 transition-colors hover:border-sky-500/30">
          <input
            type="checkbox"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-slate-950 text-sky-500 focus:ring-sky-500/40"
          />
          <span>Make this recurring (server posts on a schedule)</span>
        </label>

        {recurring ? (
          <Select
            label="Frequency"
            name="frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Select>
        ) : null}
      </form>
    </Modal>
  )
}
