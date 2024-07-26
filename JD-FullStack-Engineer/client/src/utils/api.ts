import { Filter, Params } from '../types'
import { EventResponse, Event, StatsResponse } from '../types' // Assuming your types are in a 'types.ts' file

const BASE_URL = 'http://localhost:4000/api' // Assuming your backend is on the same origin

// Fetch all events with optional parameters
export const fetchEventsApi = async (
  params?: Params
): Promise<EventResponse> => {
  try {
    const url = new URL(`${BASE_URL}/events`)

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (key === 'filter' && typeof value === 'object') {
          // Handle filter object
          for (const [filterKey, filterValue] of Object.entries(value)) {
            if (filterValue) {
              // Ignore undefined or empty filter values
              url.searchParams.set(
                `filter[${filterKey}]`,
                filterValue.toString()
              )
            }
          }
        } else if (value !== undefined || value !== '') {
          url.searchParams.set(key, value.toString())
        }
      }
    }

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`Failed to fetch events. Status: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching events:', error)
    throw error // Re-throw the error to handle it in the component
  }
}

// Fetch footprints for a specific user
export const fetchUserFootprintsApi = async (
  userId: string
): Promise<Event[]> => {
  try {
    const response: Response = await fetch(`${BASE_URL}/users/${userId}/events`)
    if (!response.ok) {
      throw new Error(
        `Failed to fetch user footprints. Status: ${response.status}`
      )
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching user footprints:', error)
    throw error
  }
}

export const fetchStatsApi = async (
  filter?: Filter
): Promise<StatsResponse> => {
  try {
    const url = new URL(`${BASE_URL}/stats`)
    if (filter) {
      for (const [filterKey, filterValue] of Object.entries(filter)) {
        if (filterValue !== undefined && filterValue !== '') {
          // Ignore undefined or empty filter values
          url.searchParams.set(`filter[${filterKey}]`, filterValue.toString())
        }
      }
    }
    const response: Response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`Failed to fetch stats. Status: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching stats:', error)
    throw error
  }
}
