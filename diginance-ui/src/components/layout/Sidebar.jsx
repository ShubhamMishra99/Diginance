import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ListOrdered,
  LineChart,
  PiggyBank,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

const linkBase =
  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white'
const linkActive =
  'bg-gradient-to-r from-sky-500/15 to-violet-500/10 text-white shadow-lg shadow-sky-500/5 ring-1 ring-sky-500/20'

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const { logout, isAdmin, user } = useAuth()

  const nav = (
    <>
      <NavLink
        to="/app"
        end
        onClick={() => setMobileOpen(false)}
        className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : ''}`
        }
      >
        <LayoutDashboard className="h-5 w-5 shrink-0 text-sky-400" />
        Dashboard
      </NavLink>
      <NavLink
        to="/app/records"
        onClick={() => setMobileOpen(false)}
        className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : ''}`
        }
      >
        <ListOrdered className="h-5 w-5 shrink-0 text-violet-400" />
        Records
      </NavLink>
      <NavLink
        to="/app/analytics"
        onClick={() => setMobileOpen(false)}
        className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : ''}`
        }
      >
        <LineChart className="h-5 w-5 shrink-0 text-fuchsia-400" />
        Analytics
      </NavLink>
      <NavLink
        to="/app/budgets"
        onClick={() => setMobileOpen(false)}
        className={({ isActive }) =>
          `${linkBase} ${isActive ? linkActive : ''}`
        }
      >
        <PiggyBank className="h-5 w-5 shrink-0 text-amber-400" />
        Budgets
      </NavLink>
      {isAdmin ? (
        <NavLink
          to="/app/users"
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : ''}`
          }
        >
          <Users className="h-5 w-5 shrink-0 text-emerald-400" />
          Users
        </NavLink>
      ) : null}
    </>
  )

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/5 bg-slate-950/40 py-6 pl-4 pr-3 backdrop-blur-xl lg:flex">
        <div className="mb-10 px-2">
          <p className="font-display text-xl font-bold tracking-tight text-white">
            Diginance
          </p>
          <p className="mt-1 text-xs text-slate-500">Finance intelligence</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">{nav}</nav>
        <div className="mt-auto border-t border-white/5 pt-4">
          <p className="truncate px-2 text-xs text-slate-500">
            {user?.username}
            {user?.role ? (
              <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-slate-600">
                {user.role}
              </span>
            ) : null}
          </p>
          <button
            type="button"
            onClick={logout}
            className={`${linkBase} mt-2 w-full text-left text-rose-300/90 hover:text-rose-200`}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[min(100%,280px)] flex-col border-r border-white/10 bg-slate-950/95 py-6 pl-4 pr-3 shadow-2xl shadow-violet-500/10">
            <div className="mb-8 flex items-center justify-between px-2">
              <span className="font-display text-lg font-bold text-white">
                Diginance
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1">{nav}</nav>
            <button
              type="button"
              onClick={() => {
                logout()
                setMobileOpen(false)
              }}
              className={`${linkBase} text-rose-300/90`}
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}

export function MobileHeader({ onMenu }) {
  return (
    <header className="flex items-center justify-between border-b border-white/5 bg-slate-950/30 px-4 py-3 backdrop-blur-xl lg:hidden">
      <button
        type="button"
        onClick={onMenu}
        className="rounded-xl p-2 text-slate-300 hover:bg-white/5 hover:text-white"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>
      <span className="font-display text-lg font-bold text-white">Diginance</span>
      <span className="w-10" />
    </header>
  )
}
