"use client"

import React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Shield,
  Users,
  Calendar,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/dashboard/arbitros", label: "Arbitros", icon: Users },
  { href: "/dashboard/designar/futbol_11", label: "Futbol 11", icon: Calendar },
  { href: "/dashboard/designar/futbol_7", label: "Futbol 7", icon: Calendar },
  { href: "/dashboard/designar/futbol_femenino", label: "Futbol Femenino", icon: Calendar },
  { href: "/dashboard/designar/futbol_sala", label: "Futbol Sala", icon: Calendar },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-muted">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Cerrar menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[hsl(153,40%,12%)] transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-[hsl(153,25%,22%)] px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(153,60%,28%)]">
            <Shield className="h-5 w-5 text-[hsl(0,0%,100%)]" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[hsl(0,0%,100%)]">RFAF Arbitros</h1>
            <p className="text-xs text-[hsl(153,10%,55%)]">Designaciones</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto text-[hsl(153,10%,55%)] lg:hidden"
            aria-label="Cerrar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[hsl(153,60%,28%)] text-[hsl(0,0%,100%)]"
                    : "text-[hsl(153,10%,65%)] hover:bg-[hsl(153,30%,18%)] hover:text-[hsl(0,0%,100%)]"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-[hsl(153,25%,22%)] p-3">
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start gap-3 text-[hsl(153,10%,55%)] hover:bg-[hsl(153,30%,18%)] hover:text-[hsl(0,0%,100%)]"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesion
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-muted-foreground lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Administrador</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
