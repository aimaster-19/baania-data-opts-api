/**
 * Pagination interfaces for standardized paginated API responses.
 */

/** Query parameters accepted from the client */
export interface PaginationQuery {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  order?: 'asc' | 'desc'
  // Filter fields specific to projectRead
  propertyType?: string
  province?: string
  status?: string
}

/** Pagination metadata returned in responses */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

/** Standardized paginated response */
export interface PaginatedResponse<T> {
  status: number
  data: T[]
  pagination: PaginationMeta
}

/** Internal options passed to the service layer */
export interface PaginationOptions {
  page: number
  limit: number
  filter: Record<string, any>
  sort: Record<string, 1 | -1>
  select?: string | Record<string, 0 | 1>
}
