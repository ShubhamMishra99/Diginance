import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated, bootstrapping } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!bootstrapping && isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!username.trim()) return
    setSubmitting(true)
    try {
      await login(username.trim(), password)
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.message || 'Sign in failed')
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
        <div className="absolute -left-1/4 top-1/4 h-96 w-96 rounded-full bg-sky-500/20 blur-[120px]" />
        <div className="absolute -right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-violet-600/15 blur-[120px]" />
      </div>

      <div className="glass-panel relative z-10 w-full max-w-md p-8 sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Diginance
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to your workspace
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
            placeholder="your_username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Continue'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          No account?{' '}
          <Link
            to="/register"
            className="font-medium text-sky-400 transition-colors hover:text-sky-300"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
