import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

export default async function Home() {
  const isAuthenticated = await getSession()
  if (isAuthenticated) {
    redirect("/dashboard")
  }
  redirect("/login")
}
