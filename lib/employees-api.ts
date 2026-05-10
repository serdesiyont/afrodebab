const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_BASE_URL!

export interface EmployeeApi {
  id: number
  name: string
  email: string
  phone: string
  position: string
  linkedinUrl?: string | null
  photo?: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface EmployeeListResponse {
  content: EmployeeApi[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type EmployeeSortBy = "createdAt" | "name" | "email" | "position" | string
export type EmployeeSortDirection = "asc" | "desc"

export async function fetchEmployees(
  page: number = 0,
  size: number = 10,
  sortBy?: EmployeeSortBy,
  direction?: EmployeeSortDirection
): Promise<EmployeeListResponse> {
  const params = new URLSearchParams()
  params.set("page", String(page))
  params.set("size", String(size))
  if (sortBy) params.set("sortBy", sortBy)
  if (direction) params.set("direction", direction)

  const res = await fetch(`${CMS_BASE_URL}/admin/employees?${params.toString()}`, {
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch employees: ${res.status}`)
  }
  return res.json()
}
