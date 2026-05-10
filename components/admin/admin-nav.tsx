"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { clearAdminClientToken } from "@/lib/admin-client-auth"

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/employees", label: "Employees" },
]

export function AdminNav() {
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    clearAdminClientToken()
    window.location.href = "/login"
  }

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-[#e78a53]/15 text-[#e78a53]"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            }`}
          >
            {item.label}
          </Link>
        )
      })}
      <div className="mt-auto border-t border-zinc-800 pt-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          onClick={handleLogout}
        >
          Log out
        </Button>
      </div>
    </nav>
  )
}
