import { NextRequest, NextResponse } from "next/server"
import {
  getCookieName,
  getMaxAgeFromToken,
} from "@/lib/auth"

const CMS_LOGIN_URL = "https://afrodebab-cms-api.onrender.com/admin/auth/login"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === "string" ? body.email.trim() : ""
    const password = typeof body.password === "string" ? body.password : ""

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const res = await fetch(CMS_LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = (await res.json().catch(() => ({}))) as { token?: string }
    if (!res.ok) {
      return NextResponse.json(
        { error: (data as { message?: string }).message ?? "Invalid email or password" },
        { status: 401 }
      )
    }

    const token = data.token
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid response from auth server" },
        { status: 502 }
      )
    }

    const maxAge = getMaxAgeFromToken(token)
    const response = NextResponse.json({ ok: true })
    response.cookies.set({
      name: getCookieName(),
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
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
