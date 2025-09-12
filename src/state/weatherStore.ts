import { create } from 'zustand'
import { fetchCurrentConditions, CurrentConditionPayload } from '@service/weatherService'
import { calculateDistance } from '@utils/etaCalculator'

export const WEATHER_REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
export const SIGNIFICANT_DISTANCE_KM = 1; // 1 km

interface WeatherState {
  current?: CurrentConditionPayload
  updatedAt?: number
  lastLat?: number
  lastLng?: number
  setCurrent: (c: CurrentConditionPayload) => void
  refresh: (lat: number, lng: number) => Promise<void>
  needsRefresh: (lat: number, lng: number, now?: number) => boolean
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  current: undefined,
  updatedAt: undefined,
  lastLat: undefined,
  lastLng: undefined,

  setCurrent: (c) => set({ current: c, updatedAt: Date.now() }),

  refresh: async (lat, lng) => {
    const data = await fetchCurrentConditions(lat, lng)
    set({ current: data, updatedAt: Date.now(), lastLat: lat, lastLng: lng })
  },

  needsRefresh: (lat: number, lng: number, now: number = Date.now()) => {
    const { updatedAt, lastLat, lastLng } = get()
    if (!updatedAt || lastLat == null || lastLng == null) return true

    const age = now - updatedAt
    if (age >= WEATHER_REFRESH_INTERVAL_MS) return true

    const dist = calculateDistance(lastLat, lastLng, lat, lng)
    return dist >= SIGNIFICANT_DISTANCE_KM
  }
}))

