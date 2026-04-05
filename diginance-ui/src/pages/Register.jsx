import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'

export function Register() {
  const navigate = useNavigate()
  const { register, isAuthenticated, bootstrapping } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!bootstrapping && isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password) return
    setSubmitting(true)
    try {
      await register(username.trim(), password, role)
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-500/15 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-500/10 blur-[100px]" />
      </div>

      <div className="glass-panel relative z-10 w-full max-w-md p-8 sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Join Diginance
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Start tracking in minutes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error ? (
            <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          ) : null}
          <Input
            label="Username"
            name="username"
            autoComplete="username"
            placeholder="unique_username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Select
            label="Account role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">Member — standard access</option>
            <option value="manager">Manager — elevated API routes (e.g. /api/users/manager)</option>
            <option value="admin">Admin — user directory & full admin routes</option>
          </Select>
          <p className="text-left text-xs text-slate-500">
            Roles match your API (<code className="text-slate-400">userModel</code>
            ). In production, restrict who can pick admin/manager.
          </p>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have access?{' '}
          <Link
            to="/login"
            className="font-medium text-sky-400 transition-colors hover:text-sky-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
