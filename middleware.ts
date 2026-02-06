import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const session = request.cookies.get("rfaf_session")
  const isAuthenticated = session?.value === "authenticated"
  const isLoginPage = request.nextUrl.pathname === "/login"
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard")

  if (isDashboard && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}
