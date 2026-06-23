import { NextRequest, NextResponse } from "next/server"
import {
  getCookieName,
  getMaxAgeFromToken,
  type UserRole,
} from "@/lib/auth"

const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_BASE_URL
const ADMIN_LOGIN_URL = `${CMS_BASE_URL}/admin/auth/login`
const EMPLOYEE_LOGIN_URL = `${CMS_BASE_URL}/employee/auth/login`

async function attemptLogin(
  url: string,
  email: string,
  password: string
): Promise<{ ok: true; token: string } | { ok: false }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  const data = (await res.json().catch(() => ({}))) as { token?: string }
  if (!res.ok || typeof data.token !== "string") {
    return { ok: false }
  }
  return { ok: true, token: data.token }
}

export async function POST(request: NextRequest) {
  try {
    if (!CMS_BASE_URL) {
      return NextResponse.json(
        { error: "CMS base URL is not configured" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const email = typeof body.email === "string" ? body.email.trim() : ""
    const password = typeof body.password === "string" ? body.password : ""

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const adminResult = await attemptLogin(ADMIN_LOGIN_URL, email, password)
    const role: UserRole | null = adminResult.ok ? "admin" : null
    const finalRole = role ?? "employee"
    const finalResult = adminResult.ok
      ? adminResult
      : await attemptLogin(EMPLOYEE_LOGIN_URL, email, password)

    if (!finalResult.ok) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const token = finalResult.token
    const maxAge = getMaxAgeFromToken(token)
    const response = NextResponse.json({
      ok: true,
      role: finalRole,
      token: finalRole === "admin" ? token : undefined,
    })
    response.cookies.set({
      name: getCookieName(finalRole),
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    })
    response.cookies.set({
      name: getCookieName(finalRole === "admin" ? "employee" : "admin"),
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    return response
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
