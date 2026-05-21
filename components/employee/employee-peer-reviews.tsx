"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type {
  LeadershipPrincipleResponse,
  AdminPeerReviewResponse,
  PeerReviewAvailableEmployeeResponse,
  PeerReviewPeriodStatusResponse,
  PeerReviewRatingValue,
  PeerReviewSelfResultsResponse,
} from "@/lib/metrics-api"

const ratingOptions: Array<{ value: PeerReviewRatingValue; label: string }> = [
  { value: "EXCEEDS_THE_BAR", label: "Exceeds the bar" },
  { value: "MEETS_THE_BAR", label: "Meets the bar" },
  { value: "NEEDS_IMPROVEMENT", label: "Needs improvement" },
]

const coerceBoolean = (value: unknown) => {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value === 1
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    if (normalized === "true") return true
    if (normalized === "false") return false
  }
  return false
}

export function EmployeePeerReviews() {
  const [principles, setPrinciples] = useState<LeadershipPrincipleResponse[]>([])
  const [ratings, setRatings] = useState<Record<number, { rating: PeerReviewRatingValue; comment: string }>>({})
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")
  const [peerReviewTab, setPeerReviewTab] = useState<"new" | "submitted">("new")
  const [peerReviewPeriods, setPeerReviewPeriods] = useState<PeerReviewPeriodStatusResponse[]>([])
  const [periodsLoading, setPeriodsLoading] = useState(false)
  const [periodsError, setPeriodsError] = useState("")
  const [selectedNewPeriodId, setSelectedNewPeriodId] = useState<number | null>(null)
  const [selectedSubmittedPeriodId, setSelectedSubmittedPeriodId] = useState<number | null>(null)
  const [availableEmployees, setAvailableEmployees] = useState<PeerReviewAvailableEmployeeResponse[]>([])
  const [availableEmployeesLoading, setAvailableEmployeesLoading] = useState(false)
  const [availableEmployeesError, setAvailableEmployeesError] = useState("")
  const [selectedRevieweeId, setSelectedRevieweeId] = useState<number | null>(null)
  const [submittedResults, setSubmittedResults] = useState<PeerReviewSelfResultsResponse | null>(
    null
  )
  const [submittedResultsLoading, setSubmittedResultsLoading] = useState(false)
  const [submittedResultsError, setSubmittedResultsError] = useState("")

  const [adminReview, setAdminReview] = useState<AdminPeerReviewResponse | null>(null)
  const [adminReviewLoading, setAdminReviewLoading] = useState(false)
  const [adminReviewError, setAdminReviewError] = useState("")

  const activePrinciples = useMemo(
    () => principles.filter((principle) => principle.isActive),
    [principles]
  )
  const newPeriods = useMemo(
    () => peerReviewPeriods.filter((period) => !period.submitted),
    [peerReviewPeriods]
  )
  const submittedPeriods = useMemo(
    () => peerReviewPeriods.filter((period) => period.submitted),
    [peerReviewPeriods]
  )
  const selectedNewPeriod = useMemo(
    () => newPeriods.find((period) => period.id === selectedNewPeriodId) ?? null,
    [newPeriods, selectedNewPeriodId]
  )
  const selectedReviewee = useMemo(
    () => availableEmployees.find((employee) => employee.id === selectedRevieweeId) ?? null,
    [availableEmployees, selectedRevieweeId]
  )

  const loadPrinciples = useCallback(async () => {
    try {
      const res = await fetch("/api/employee/me/peer-reviews/principles")
      const data = await res.json().catch(() => [])
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Failed to load principles")
      }
      setPrinciples(Array.isArray(data) ? data : [])
    } catch {
      setPrinciples([])
    }
  }, [])

  const loadPeerReviewPeriods = useCallback(async () => {
    setPeriodsLoading(true)
    setPeriodsError("")
    try {
      const res = await fetch("/api/employee/me/peer-reviews/periods", { cache: "no-store" })
      const data = await res.json().catch(() => [])
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Failed to load peer review periods")
      }
      const normalized = Array.isArray(data)
        ? (data as Array<Record<string, unknown>>).map((period) => ({
            ...(period as Omit<PeerReviewPeriodStatusResponse, "submitted">),
            submitted: coerceBoolean(period.submitted ?? (period as { isSubmitted?: unknown }).isSubmitted),
          }))
        : []
      setPeerReviewPeriods(normalized as PeerReviewPeriodStatusResponse[])
    } catch (err) {
      setPeriodsError(err instanceof Error ? err.message : "Failed to load peer review periods")
      setPeerReviewPeriods([])
    } finally {
      setPeriodsLoading(false)
    }
  }, [])

  const loadAvailableEmployees = useCallback(async () => {
    setAvailableEmployeesLoading(true)
    setAvailableEmployeesError("")
    try {
      const res = await fetch("/api/employee/me/peer-reviews/available-employees")
      const data = await res.json().catch(() => [])
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Failed to load employees")
      }
      setAvailableEmployees(Array.isArray(data) ? data : [])
    } catch (err) {
      setAvailableEmployeesError(err instanceof Error ? err.message : "Failed to load employees")
      setAvailableEmployees([])
    } finally {
      setAvailableEmployeesLoading(false)
    }
  }, [])

  const loadSubmittedResults = useCallback(async (periodId: number) => {
    setSubmittedResultsLoading(true)
    setSubmittedResultsError("")
    try {
      const res = await fetch(`/api/employee/me/peer-reviews/periods/${periodId}/results`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Failed to load peer review results")
      }
      setSubmittedResults(data as PeerReviewSelfResultsResponse)
    } catch (err) {
      setSubmittedResultsError(
        err instanceof Error ? err.message : "Failed to load peer review results"
      )
      setSubmittedResults(null)
    } finally {
      setSubmittedResultsLoading(false)
    }
  }, [])

  const loadAdminReview = useCallback(async (periodId: number) => {
    setAdminReviewLoading(true)
    setAdminReviewError("")
    try {
      const res = await fetch(`/api/employee/me/peer-reviews/periods/${periodId}/admin-review`, {
        cache: "no-store",
      })

      if (res.status === 404) {
        setAdminReview(null)
        return
      }

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Failed to load admin feedback")
      }
      setAdminReview(data as AdminPeerReviewResponse)
    } catch (err) {
      setAdminReviewError(err instanceof Error ? err.message : "Failed to load admin feedback")
      setAdminReview(null)
    } finally {
      setAdminReviewLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPrinciples()
    loadPeerReviewPeriods()
    loadAvailableEmployees()
  }, [loadAvailableEmployees, loadPeerReviewPeriods, loadPrinciples])

  useEffect(() => {
    if (activePrinciples.length === 0) return
    setRatings((prev) => {
      const next = { ...prev }
      activePrinciples.forEach((principle) => {
        if (!next[principle.id]) {
          next[principle.id] = { rating: "MEETS_THE_BAR", comment: "" }
        }
      })
      return next
    })
  }, [activePrinciples])

  useEffect(() => {
    if (newPeriods.length > 0 && !newPeriods.some((period) => period.id === selectedNewPeriodId)) {
      setSelectedNewPeriodId(newPeriods[0]!.id)
    }
    if (
      submittedPeriods.length > 0 &&
      !submittedPeriods.some((period) => period.id === selectedSubmittedPeriodId)
    ) {
      setSelectedSubmittedPeriodId(submittedPeriods[0]!.id)
    }
  }, [newPeriods, submittedPeriods, selectedNewPeriodId, selectedSubmittedPeriodId])

  useEffect(() => {
    if (
      availableEmployees.length > 0 &&
      !availableEmployees.some((employee) => employee.id === selectedRevieweeId)
    ) {
      setSelectedRevieweeId(availableEmployees[0]!.id)
    }
  }, [availableEmployees, selectedRevieweeId])

  useEffect(() => {
    if (selectedSubmittedPeriodId) {
      loadSubmittedResults(selectedSubmittedPeriodId)
      loadAdminReview(selectedSubmittedPeriodId)
    } else {
      setSubmittedResults(null)
      setAdminReview(null)
    }
  }, [loadAdminReview, loadSubmittedResults, selectedSubmittedPeriodId])

  const handleSubmitReview = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitError("")
    setSubmitSuccess("")
    if (!selectedNewPeriod) {
      setSubmitError("Select a peer review period.")
      return
    }
    if (!selectedRevieweeId) {
      setSubmitError("Select an employee to review.")
      return
    }
    const payloadRatings = activePrinciples
      .map((principle) => {
        const entry = ratings[principle.id]
        if (!entry) return null
        const comment = entry.comment.trim()
        return {
          principleId: principle.id,
          rating: entry.rating,
          comment: comment ? comment : undefined,
        }
      })
      .filter((entry): entry is { principleId: number; rating: PeerReviewRatingValue; comment?: string } =>
        Boolean(entry)
      )

    if (payloadRatings.length === 0) {
      setSubmitError("Provide at least one rating before submitting.")
      return
    }

    setSubmitLoading(true)
    try {
      const res = await fetch("/api/employee/me/peer-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revieweeId: selectedRevieweeId,
          periodStart: selectedNewPeriod.periodStart,
          periodEnd: selectedNewPeriod.periodEnd,
          ratings: payloadRatings,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Failed to submit peer review")
      }
      setSubmitSuccess("Peer review submitted successfully.")
      setRatings((prev) => {
        const next = { ...prev }
        Object.keys(next).forEach((key) => {
          next[Number(key)] = { ...next[Number(key)], comment: "" }
        })
        return next
      })
      loadPeerReviewPeriods()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit peer review")
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-5 text-[#e78a53]" />
            <h2 className="text-lg font-semibold text-white">Peer Reviews</h2>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setPeerReviewTab("new")}
              className={
                peerReviewTab === "new"
                  ? "bg-[#e78a53] text-white hover:bg-[#e78a53]/90"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }
            >
              New ({newPeriods.length})
            </Button>
            <Button
              type="button"
              onClick={() => setPeerReviewTab("submitted")}
              className={
                peerReviewTab === "submitted"
                  ? "bg-[#e78a53] text-white hover:bg-[#e78a53]/90"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }
            >
              My scores ({submittedPeriods.length})
            </Button>
          </div>
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          Review periods are initiated by admin. Submit reviews in “New”, and check “My scores” for your aggregated results.
        </p>

        {periodsError && <p className="mt-3 text-sm text-red-400">{periodsError}</p>}

        {periodsLoading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-zinc-400">
            <Loader2 className="size-4 animate-spin text-[#e78a53]" />
            Loading peer review periods...
          </div>
        ) : peerReviewTab === "new" ? (
          newPeriods.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">No new peer review periods available.</p>
          ) : (
            <form className="mt-4 space-y-4" onSubmit={handleSubmitReview}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Period</Label>
                  <select
                    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
                    value={selectedNewPeriodId ?? ""}
                    onChange={(e) => setSelectedNewPeriodId(Number(e.target.value) || null)}
                  >
                    {newPeriods.map((period) => (
                      <option key={period.id} value={period.id}>
                        {period.name ? `${period.name} · ` : ""}
                        {period.periodStart} → {period.periodEnd}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Reviewee</Label>
                  {availableEmployeesLoading ? (
                    <div className="text-sm text-zinc-500">Loading employees...</div>
                  ) : availableEmployees.length === 0 ? (
                    <div className="text-sm text-zinc-500">No employees available for review.</div>
                  ) : (
                    <select
                      className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
                      value={selectedRevieweeId ?? ""}
                      onChange={(e) => setSelectedRevieweeId(Number(e.target.value) || null)}
                    >
                      {availableEmployees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} · {employee.role} · {employee.department}
                        </option>
                      ))}
                    </select>
                  )}
                  {availableEmployeesError && (
                    <p className="text-xs text-red-400">{availableEmployeesError}</p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4 text-sm text-zinc-300">
                <p className="font-semibold text-white">Selected period</p>
                <p className="mt-1">
                  {selectedNewPeriod
                    ? `${selectedNewPeriod.name ? `${selectedNewPeriod.name} · ` : ""}${selectedNewPeriod.periodStart} → ${selectedNewPeriod.periodEnd}`
                    : "—"}
                </p>
                <p className="mt-2 font-semibold text-white">Reviewing</p>
                <p className="mt-1">
                  {selectedReviewee
                    ? `${selectedReviewee.name} · ${selectedReviewee.role} · ${selectedReviewee.department}`
                    : "—"}
                </p>
              </div>

              {activePrinciples.length === 0 ? (
                <p className="text-sm text-zinc-500">No active principles available.</p>
              ) : (
                <div className="space-y-3">
                  {activePrinciples.map((principle) => {
                    const entry = ratings[principle.id]
                    return (
                      <div key={principle.id} className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
                        <div className="flex flex-col gap-2">
                          <div>
                            <p className="text-sm font-semibold text-white">{principle.name}</p>
                            <p className="text-xs text-zinc-500">{principle.description}</p>
                          </div>
                          <select
                            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
                            value={entry?.rating ?? "MEETS_THE_BAR"}
                            onChange={(e) =>
                              setRatings((prev) => ({
                                ...prev,
                                [principle.id]: {
                                  rating: e.target.value as PeerReviewRatingValue,
                                  comment: prev[principle.id]?.comment ?? "",
                                },
                              }))
                            }
                          >
                            {ratingOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <textarea
                            rows={2}
                            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
                            placeholder="Optional comment"
                            value={entry?.comment ?? ""}
                            onChange={(e) =>
                              setRatings((prev) => ({
                                ...prev,
                                [principle.id]: {
                                  rating: prev[principle.id]?.rating ?? "MEETS_THE_BAR",
                                  comment: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {submitError && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  {submitError}
                </p>
              )}
              {submitSuccess && (
                <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                  {submitSuccess}
                </p>
              )}

              <Button
                type="submit"
                disabled={
                  submitLoading ||
                  activePrinciples.length === 0 ||
                  !selectedNewPeriod ||
                  !selectedRevieweeId
                }
                className="w-full bg-[#e78a53] text-white hover:bg-[#e78a53]/90"
              >
                {submitLoading ? "Submitting..." : "Submit review"}
              </Button>
            </form>
          )
        ) : submittedPeriods.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No peer review results yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Period</Label>
              <select
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
                value={selectedSubmittedPeriodId ?? ""}
                onChange={(e) => setSelectedSubmittedPeriodId(Number(e.target.value) || null)}
              >
                {submittedPeriods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.name ? `${period.name} · ` : ""}
                    {period.periodStart} → {period.periodEnd}
                  </option>
                ))}
              </select>
            </div>

            {submittedResultsError && (
              <p className="text-sm text-red-400">{submittedResultsError}</p>
            )}

            {submittedResultsLoading ? (
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Loader2 className="size-4 animate-spin text-[#e78a53]" />
                Loading peer review results...
              </div>
            ) : submittedResults ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4 text-sm text-zinc-300">
                  <p className="font-semibold text-white">
                    {submittedResults.periodName ?? "Peer review results"}
                  </p>
                  <p className="mt-1">
                    {submittedResults.periodStart} → {submittedResults.periodEnd}
                  </p>
                  {typeof submittedResults.leadershipScore === "number" && (
                    <p className="mt-2 text-sm text-zinc-200">
                      Leadership score: {submittedResults.leadershipScore.toFixed(2)}%
                    </p>
                  )}
                </div>

                {adminReviewError && <p className="text-sm text-red-400">{adminReviewError}</p>}

                {adminReviewLoading ? (
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Loader2 className="size-4 animate-spin text-[#e78a53]" />
                    Loading admin feedback...
                  </div>
                ) : adminReview ? (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4 text-sm text-zinc-300">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-white">Admin feedback</p>
                      <span className="text-xs text-zinc-500">
                        {new Date(adminReview.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-zinc-400">
                      {adminReview.reviewerName} · {adminReview.rating.replace(/_/g, " ")}
                    </p>
                    <p className="mt-2 text-sm text-zinc-200">{adminReview.feedback}</p>
                  </div>
                ) : null}

                {Array.isArray(submittedResults.principleAverages) &&
                submittedResults.principleAverages.length > 0 ? (
                  <div className="space-y-3">
                    {submittedResults.principleAverages.map((principle) => (
                      <div
                        key={principle.principleId}
                        className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-white">{principle.principleName}</p>
                          <span className="text-xs text-zinc-400">
                            {principle.ratingCount} rating{principle.ratingCount === 1 ? "" : "s"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-300">
                          Average rating: {principle.averageRating.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">No aggregated results yet.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">Select a period to view your scores.</p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
