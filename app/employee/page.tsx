"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Loader2, User, Lock, Clock, LogOut, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { clearAdminClientToken } from "@/lib/admin-client-auth"
import { QRScanner } from "@/components/employee/qr-scanner"

interface EmployeeInfo {
  id: number
  name: string
  email: string
  phone: string
  position: string
  photo?: string | null
}

const QR_VALID_URL = "https://attendance.gogerami.com"

export default function EmployeePage() {
  const [employee, setEmployee] = useState<EmployeeInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showScanner, setShowScanner] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [clockAction, setClockAction] = useState<"clockIn" | "clockOut" | null>(null)
  const [clockLoading, setClockLoading] = useState(false)
  const [clockMessage, setClockMessage] = useState("")

  const fetchEmployee = useCallback(async () => {
    try {
      const res = await fetch("/api/employee/me")
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? "Failed to fetch profile")
      }
      const data = await res.json()
      setEmployee(data)
    } catch (err) {
      console.error("Failed to fetch employee:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmployee()
  }, [fetchEmployee])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/employee/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (res.status === 204) {
        setCurrentPassword("")
        setNewPassword("")
        setSuccess("Password changed successfully.")
        setIsSubmitting(false)
        setTimeout(() => {
          setShowPasswordForm(false)
          setSuccess("")
        }, 2000)
        return
      }
      const data = await res.json().catch(() => ({}))
      setError((data as { error?: string }).error ?? "Failed to change password")
    } catch {
      setError("Something went wrong. Please try again.")
    }
    setIsSubmitting(false)
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    clearAdminClientToken()
    window.location.href = "/login"
  }

  const handleClockAction = (action: "clockIn" | "clockOut") => {
    setClockAction(action)
    setShowScanner(true)
    setClockMessage("")
  }

  const handleQRScan = async (qrData: string) => {
    setShowScanner(false)
    setClockLoading(true)
    setClockMessage("")

    if (qrData !== QR_VALID_URL) {
      setClockMessage("Invalid QR code. Please scan the correct attendance QR code.")
      setClockLoading(false)
      return
    }

    try {
      const res = await fetch("/api/employee/attendance/clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: clockAction,
          qrData,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setClockMessage((data as { error?: string }).error ?? "Failed to record attendance")
      } else {
        setClockMessage(clockAction === "clockIn" ? "Clock in recorded successfully!" : "Clock out recorded successfully!")
      }
    } catch {
      setClockMessage("Failed to record attendance. Please try again.")
    }

    setClockLoading(false)
    setClockAction(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="size-8 animate-spin text-[#e78a53]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="mx-auto max-w-3xl p-6 md:p-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Employee Portal</h1>
            <p className="mt-1 text-zinc-400">Manage your account and attendance.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              onClick={() => setShowPasswordForm(true)}
            >
              <Key className="mr-2 size-4" />
              Password
            </Button>
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 size-4" />
              Log out
            </Button>
          </div>
        </div>

        {employee && (
          <section className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex items-center gap-4">
              {employee.photo ? (
                <img
                  src={employee.photo}
                  alt={employee.name}
                  className="size-12 rounded-full object-cover ring-2 ring-zinc-700"
                />
              ) : (
                <div className="flex size-12 items-center justify-center rounded-full bg-zinc-800 ring-2 ring-zinc-700">
                  <User className="size-6 text-zinc-500" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{employee.name}</h2>
                <p className="text-base font-medium text-zinc-300">{employee.position}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-400">{employee.email}</p>
                {employee.phone && <p className="text-sm text-zinc-400">{employee.phone}</p>}
              </div>
            </div>
          </section>
        )}

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="size-5 text-[#e78a53]" />
            <h2 className="text-lg font-semibold text-white">Attendance</h2>
          </div>

          {clockMessage && (
            <p
              className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
                clockMessage.includes("success")
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border-red-500/20 bg-red-500/10 text-red-400"
              }`}
            >
              {clockMessage}
            </p>
          )}

          {clockLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="size-5 animate-spin text-[#e78a53]" />
              <span className="text-zinc-400">Recording attendance...</span>
            </div>
          ) : (
            <div className="flex gap-4">
              <Button
                onClick={() => handleClockAction("clockIn")}
                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-600/90"
              >
                <Clock className="mr-2 size-4" />
                Clock In
              </Button>
              <Button
                onClick={() => handleClockAction("clockOut")}
                className="flex-1 bg-orange-600 text-white hover:bg-orange-600/90"
              >
                <Clock className="mr-2 size-4" />
                Clock Out
              </Button>
            </div>
          )}
          <p className="mt-3 text-sm text-zinc-500">
            Click the button to scan the workplace QR code
          </p>
        </section>
      </main>

      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => {
            setShowScanner(false)
            setClockAction(null)
          }}
        />
      )}

      {showPasswordForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Change Password</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowPasswordForm(false)}>
                <span className="text-zinc-400 hover:text-white">✕</span>
              </Button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-zinc-200">
                  Current password
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-zinc-200">
                  New password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  {error}
                </p>
              )}
              {success && (
                <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                  {success}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#e78a53] text-white hover:bg-[#e78a53]/90"
                >
                  {isSubmitting ? "Updating..." : "Update password"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPasswordForm(false)}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}