import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySessionCookie } from "@/lib/auth"

const ADMIN_PREFIX = "/admin"
const LOGIN_PATH = "/login"
const AUTH_API_PREFIX = "/api/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow API auth routes (login, logout)
  if (pathname.startsWith(AUTH_API_PREFIX)) {
    return NextResponse.next()
  }

  const cookieHeader = request.headers.get("cookie")
  const session = await verifySessionCookie(cookieHeader)

  // Protect admin: only logged-in users
  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (!session) {
      const loginUrl = new URL(LOGIN_PATH, request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // If already logged in and visiting login, redirect to admin
  if (pathname === LOGIN_PATH && session) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl")
    return NextResponse.redirect(new URL(callbackUrl || ADMIN_PREFIX, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/login", "/api/auth/:path*"],
}
