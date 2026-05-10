import Link from "next/link"
import { headers } from "next/headers"
import { BLOG_POSTS } from "@/lib/blog-data"
import { fetchJobs } from "@/lib/jobs-api"
import { fetchEvents } from "@/lib/events-api"
import { getAdminToken } from "@/lib/auth"

export default async function AdminDashboardPage() {
  let jobsCount = 0
  let openJobsCount = 0
  try {
    const jobsRes = await fetchJobs(0, 100)
    jobsCount = jobsRes.totalElements
    openJobsCount = jobsRes.content.filter((j) => j.status === "OPEN").length
  } catch {
    // ignore
  }
  let eventsCount = 0
  let publishedEventsCount = 0
  try {
    const eventsRes = await fetchEvents(0, 100)
    eventsCount = eventsRes.totalElements
    publishedEventsCount = eventsRes.content.filter((e) => e.status === "PUBLISHED").length
  } catch {
    // ignore
  }
  let employeesCount = 0
  let activeEmployeesCount = 0
  try {
    const cookieHeader = (await headers()).get("cookie")
    const token = getAdminToken(cookieHeader)
    if (token) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_CMS_BASE_URL}/admin/employees?page=0&size=100&sortBy=createdAt&direction=desc`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      )
      if (res.ok) {
        const employeesRes = (await res.json()) as {
          totalElements: number
          content: Array<{ active: boolean }>
        }
        employeesCount = employeesRes.totalElements
        activeEmployeesCount = employeesRes.content.filter((employee) => employee.active).length
      }
    }
  } catch {
    // ignore
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-zinc-400 mb-8">Manage blog, jobs, events, and employees.</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/blog"
          className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-[#e78a53]/40 hover:bg-zinc-900"
        >
          <h2 className="text-lg font-semibold text-white mb-1">Blog</h2>
          <p className="text-3xl font-bold text-[#e78a53]">{BLOG_POSTS.length}</p>
          <p className="text-sm text-zinc-500 mt-1">posts</p>
        </Link>
        <Link
          href="/admin/jobs"
          className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-[#e78a53]/40 hover:bg-zinc-900"
        >
          <h2 className="text-lg font-semibold text-white mb-1">Jobs</h2>
          <p className="text-3xl font-bold text-[#e78a53]">{jobsCount}</p>
          <p className="text-sm text-zinc-500 mt-1">
            {openJobsCount} open
          </p>
        </Link>
        <Link
          href="/admin/events"
          className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-[#e78a53]/40 hover:bg-zinc-900"
        >
          <h2 className="text-lg font-semibold text-white mb-1">Events</h2>
          <p className="text-3xl font-bold text-[#e78a53]">{eventsCount}</p>
          <p className="text-sm text-zinc-500 mt-1">
            {publishedEventsCount} published
          </p>
        </Link>
        <Link
          href="/admin/employees"
          className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-[#e78a53]/40 hover:bg-zinc-900"
        >
          <h2 className="text-lg font-semibold text-white mb-1">Employees</h2>
          <p className="text-3xl font-bold text-[#e78a53]">{employeesCount}</p>
          <p className="text-sm text-zinc-500 mt-1">{activeEmployeesCount} active</p>
        </Link>
      </div>

      <div className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick links</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/blog" className="text-[#e78a53] hover:underline">
              View public blog →
            </Link>
          </li>
          <li>
            <Link href="/jobs" className="text-[#e78a53] hover:underline">
              View public jobs →
            </Link>
          </li>
          <li>
            <Link href="/events" className="text-[#e78a53] hover:underline">
              View public events →
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
