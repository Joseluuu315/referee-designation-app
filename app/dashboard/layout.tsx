import React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DashboardShell } from "@/components/dashboard-shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAuthenticated = await getSession()
  if (!isAuthenticated) {
    redirect("/login")
  }

  return <DashboardShell>{children}</DashboardShell>
}
