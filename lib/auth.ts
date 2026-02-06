"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const ADMIN_USER = "admin"
const ADMIN_PASS = "designacion123"
const SESSION_COOKIE = "rfaf_session"

export async function login(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })
    redirect("/dashboard")
  }

  redirect("/login?error=invalid")
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect("/login")
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  return session?.value === "authenticated"
}
