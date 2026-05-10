import { NextRequest, NextResponse } from "next/server"
import { getAdminToken } from "@/lib/auth"

const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_BASE_URL!

export async function POST(request: NextRequest) {
  const token = getAdminToken(request.headers.get("cookie"))
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const payload = {
      title: typeof body.title === "string" ? body.title : "",
      slug: typeof body.slug === "string" ? body.slug : "",
      excerpt: typeof body.excerpt === "string" ? body.excerpt : "",
      content: typeof body.content === "string" ? body.content : "",
      coverImageUrl: typeof body.coverImageUrl === "string" ? body.coverImageUrl : "",
      status: body.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
    }

    const res = await fetch(`${CMS_BASE_URL}/admin/blogs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(
        { error: (data as { message?: string }).message ?? "Failed to create blog" },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error("Admin create blog error:", err)
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 }
    )
  }
}
