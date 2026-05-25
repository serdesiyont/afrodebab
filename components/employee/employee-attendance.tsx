"use client"

import { useState } from "react"
import { Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QRScanner } from "@/components/employee/qr-scanner"

const QR_VALID_URL = "https://attendance.gogerami.com"

export function EmployeeAttendance() {
  const [showScanner, setShowScanner] = useState(false)
  const [clockAction, setClockAction] = useState<
    "clockIn" | "clockOut" | "lunchBreakIn" | "lunchBreakOut" | null
  >(null)
  const [clockLoading, setClockLoading] = useState(false)
  const [clockMessage, setClockMessage] = useState("")

  const handleClockAction = (action: "clockIn" | "clockOut" | "lunchBreakIn" | "lunchBreakOut") => {
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
        const actionMessage =
          clockAction === "clockIn"
            ? "Clock in recorded successfully!"
            : clockAction === "clockOut"
              ? "Clock out recorded successfully!"
              : clockAction === "lunchBreakIn"
                ? "Lunch break start recorded successfully!"
                : "Lunch break end recorded successfully!"
        setClockMessage(actionMessage)
      }
    } catch {
      setClockMessage("Failed to record attendance. Please try again.")
    }

    setClockLoading(false)
    setClockAction(null)
  }

  return (
    <>
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
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                onClick={() => handleClockAction("clockIn")}
                className="bg-emerald-600 text-white hover:bg-emerald-600/90"
              >
                <Clock className="mr-2 size-4" />
                Clock In
              </Button>
              <Button
                onClick={() => handleClockAction("clockOut")}
                className="bg-orange-600 text-white hover:bg-orange-600/90"
              >
                <Clock className="mr-2 size-4" />
                Clock Out
              </Button>
              <Button
                onClick={() => handleClockAction("lunchBreakIn")}
                className="bg-sky-700 text-white hover:bg-sky-700/90"
              >
                <Clock className="mr-2 size-4" />
                Lunch Break In
              </Button>
              <Button
                onClick={() => handleClockAction("lunchBreakOut")}
                className="bg-indigo-700 text-white hover:bg-indigo-700/90"
              >
                <Clock className="mr-2 size-4" />
                Lunch Break Out
              </Button>
            </div>
            <p className="mt-3 text-sm text-zinc-500">
              Click any action and scan the workplace QR code.
            </p>
          </>
        )}
      </section>

      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => {
            setShowScanner(false)
            setClockAction(null)
          }}
        />
      )}
    </>
  )
}
