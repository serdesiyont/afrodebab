import { NextRequest, NextResponse } from "next/server"
import { getEmployeeToken } from "@/lib/auth"

const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_BASE_URL!

export async function POST(request: NextRequest) {
  const token = getEmployeeToken(request.headers.get("cookie"))
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action } = body

    if (!action || !["clockIn", "clockOut", "lunchBreakIn", "lunchBreakOut"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const endpoint =
      action === "clockIn"
        ? "/employee/me/clock-in"
        : action === "clockOut"
          ? "/employee/me/clock-out"
          : action === "lunchBreakIn"
            ? "/employee/me/lunch-break-in"
            : "/employee/me/lunch-break-out"

    const res = await fetch(`${CMS_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(
        { error: (data as { message?: string }).message ?? "Failed to record attendance" },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error("Clock attendance error:", err)
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 })
  }
}