export interface Event {
  id: string
  source: string
  userId: string
  eventType: string
  eventData: any // JSON data specific to the event type
  createdAt: string
  updatedAt: string
}

export interface EventResponse {
  events: Event[]
  totalPages: number
  currentPage: number
}

export interface StatsResponse {
  stats: any[]
}

export interface ChartDataPoint {
  name: string
  value: number
}

export interface Filter {
  source?: string
  userId?: string
  eventType?: string
  startDate?: string
  endDate?: string
}

export interface Params {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: string
  filter?: Filter
}
