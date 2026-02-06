import { redirect } from "next/navigation"
import { getSession, login } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const isAuthenticated = await getSession()
  if (isAuthenticated) {
    redirect("/dashboard")
  }

  const params = await searchParams
  return <LoginForm error={params.error} loginAction={login} />
}
