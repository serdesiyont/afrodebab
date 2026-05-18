"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ApplicationStatus, JobApplicationApi } from "@/lib/job-applications-api"

const INTERVIEW_ELIGIBLE_STATUSES = new Set(["APPLIED", "UNDER_REVIEW"])
const STATUS_FILTERS: Array<"ALL" | ApplicationStatus> = [
  "ALL",
  "APPLIED",
  "UNDER_REVIEW",
  "SELECTED_FOR_INTERVIEW",
  "REJECTED",
  "HIRED",
]

export default function AdminJobApplicantsPage() {
  const params = useParams<{ id: string }>()
  const jobId = params?.id
  const [applications, setApplications] = useState<JobApplicationApi[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)
  const [selectingInterview, setSelectingInterview] = useState(false)
  const [statusFilter, setStatusFilter] = useState<"ALL" | ApplicationStatus>("ALL")
  const [hireTarget, setHireTarget] = useState<JobApplicationApi | null>(null)
  const [hirePhone, setHirePhone] = useState("")
  const [hirePosition, setHirePosition] = useState("")
  const [hireSalaryDate, setHireSalaryDate] = useState("")
  const [hireSalaryAmount, setHireSalaryAmount] = useState("")
  const [hiring, setHiring] = useState(false)

  const fetchApplications = useCallback(async () => {
    if (!jobId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/job-applications/${jobId}`, { cache: "no-store" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? "Failed to load applicants")
      }
      const data = await res.json()
      const list = Array.isArray(data) ? (data as JobApplicationApi[]) : []
      setApplications(list)
      const allowedIds = new Set(
        list
          .filter((application) => INTERVIEW_ELIGIBLE_STATUSES.has(application.status))
          .map((application) => application.id)
      )
      setSelectedIds((prev) => prev.filter((id) => allowedIds.has(id)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applicants")
      setApplications([])
      setSelectedIds([])
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const filteredApplications = useMemo(() => {
    if (statusFilter === "ALL") return applications
    return applications.filter((application) => application.status === statusFilter)
  }, [applications, statusFilter])

  const selectedEligibleIds = useMemo(
    () =>
      selectedIds.filter((id) => {
        const found = filteredApplications.find((application) => application.id === id)
        return Boolean(found && INTERVIEW_ELIGIBLE_STATUSES.has(found.status))
      }),
    [filteredApplications, selectedIds]
  )

  const toggleSelection = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) return [...prev, id]
      return prev.filter((value) => value !== id)
    })
  }

  const handleMarkUnderReview = async (applicationId: number) => {
    setStatusUpdatingId(applicationId)
    setError(null)
    try {
      const res = await fetch(`/api/admin/job-applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "UNDER_REVIEW" }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Failed to update status")
      }
      await fetchApplications()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status")
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const handleSelectInterview = async () => {
    if (!jobId || selectedEligibleIds.length === 0) return
    setSelectingInterview(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/job-applications/${jobId}/select-interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationIds: selectedEligibleIds }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Failed to select interview candidates")
      }
      setSelectedIds([])
      await fetchApplications()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select interview candidates")
    } finally {
      setSelectingInterview(false)
    }
  }

  const openHireForm = (application: JobApplicationApi) => {
    setHireTarget(application)
    setHirePhone(application.phoneNumber ?? "")
    setHirePosition("")
    setHireSalaryDate("")
    setHireSalaryAmount("")
  }

  const closeHireForm = () => {
    if (hiring) return
    setHireTarget(null)
    setHirePhone("")
    setHirePosition("")
    setHireSalaryDate("")
    setHireSalaryAmount("")
  }

  const handleHire = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!jobId || !hireTarget) return
    const majorAmount = Number(hireSalaryAmount)
    if (!Number.isFinite(majorAmount) || majorAmount <= 0) {
      setError("Salary amount must be greater than zero.")
      return
    }

    setHiring(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/job-applications/${jobId}/hire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: hireTarget.id,
          phone: hirePhone.trim(),
          position: hirePosition.trim(),
          salaryDate: hireSalaryDate,
          salaryAmountMinor: Math.round(majorAmount * 100),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Failed to hire applicant")
      }
      closeHireForm()
      await fetchApplications()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to hire applicant")
    } finally {
      setHiring(false)
    }
  }

  const formatTimestamp = (value: string) => new Date(value).toLocaleString()

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Applicants</h1>
          <p className="mt-1 text-zinc-400">Manage applicants for job #{jobId}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "ALL" | ApplicationStatus)}
            className="h-10 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-200"
            aria-label="Filter applicants by status"
          >
            {STATUS_FILTERS.map((status) => (
              <option key={status} value={status}>
                {status === "ALL" ? "All statuses" : status}
              </option>
            ))}
          </select>
          <Button
            type="button"
            onClick={handleSelectInterview}
            disabled={selectingInterview || selectedEligibleIds.length === 0}
            className="bg-[#e78a53] text-white hover:bg-[#e78a53]/90"
          >
            {selectingInterview ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Selecting
              </>
            ) : (
              `Select for Interview (${selectedEligibleIds.length})`
            )}
          </Button>
          <Link
            href="/admin/jobs"
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700 hover:text-white"
          >
            Back to jobs
          </Link>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      {hireTarget && (
        <form
          onSubmit={handleHire}
          className="mb-6 grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 md:grid-cols-5"
        >
          <Input
            value={hirePhone}
            onChange={(event) => setHirePhone(event.target.value)}
            placeholder="Phone"
            required
            className="bg-zinc-800 border-zinc-700 text-white"
          />
          <Input
            value={hirePosition}
            onChange={(event) => setHirePosition(event.target.value)}
            placeholder="Position"
            required
            className="bg-zinc-800 border-zinc-700 text-white"
          />
          <Input
            value={hireSalaryDate}
            onChange={(event) => setHireSalaryDate(event.target.value)}
            type="date"
            required
            className="bg-zinc-800 border-zinc-700 text-white"
          />
          <Input
            value={hireSalaryAmount}
            onChange={(event) => setHireSalaryAmount(event.target.value)}
            type="number"
            min={0.01}
            step={0.01}
            placeholder="Salary amount"
            required
            className="bg-zinc-800 border-zinc-700 text-white"
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={hiring}
              className="bg-[#e78a53] text-white hover:bg-[#e78a53]/90"
            >
              {hiring ? "Hiring..." : `Hire ${hireTarget.fullName}`}
            </Button>
            <Button type="button" variant="outline" disabled={hiring} onClick={closeHireForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-[#e78a53]" aria-hidden />
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-zinc-400">
          No applicants found for this job.
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-zinc-400">
          No applicants found with status {statusFilter}.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">Pick</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">Applicant</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">Contact</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">Status</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">Applied</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application) => {
                const canSelectForInterview = INTERVIEW_ELIGIBLE_STATUSES.has(application.status)
                const canHire = application.status === "SELECTED_FOR_INTERVIEW"
                const isSelected = selectedIds.includes(application.id)
                return (
                  <tr key={application.id} className="border-b border-zinc-800/80 align-top last:border-0">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!canSelectForInterview}
                        onChange={(event) => toggleSelection(application.id, event.target.checked)}
                        aria-label={`Select ${application.fullName}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{application.fullName}</p>
                      <p className="text-sm text-zinc-500">#{application.id}</p>
                      {application.resumeUrl && (
                        <a
                          href={application.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#e78a53] hover:underline"
                        >
                          View resume
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      <p>{application.email}</p>
                      {application.phoneNumber && <p className="text-sm text-zinc-400">{application.phoneNumber}</p>}
                      {application.githubUrl && (
                        <a
                          href={application.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#e78a53] hover:underline"
                        >
                          GitHub
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          application.status === "HIRED"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : application.status === "REJECTED"
                              ? "bg-red-500/20 text-red-400"
                              : application.status === "SELECTED_FOR_INTERVIEW"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {application.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{formatTimestamp(application.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={application.status !== "APPLIED" || statusUpdatingId === application.id}
                          onClick={() => handleMarkUnderReview(application.id)}
                        >
                          {statusUpdatingId === application.id ? "Saving..." : "Mark Under Review"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-[#e78a53] text-white hover:bg-[#e78a53]/90"
                          disabled={!canHire}
                          onClick={() => openHireForm(application)}
                        >
                          Hire
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
