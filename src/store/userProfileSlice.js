import { createSlice } from '@reduxjs/toolkit'

// Load initial state from localStorage
const getInitialState = () => {
  try {
    const storedProfile = localStorage.getItem('ott_user_profile')
    if (storedProfile) {
      return JSON.parse(storedProfile)
    }
  } catch (error) {
    console.error('Error loading user profile from localStorage:', error)
  }
  return {
    watchlist: [],
    favorites: [],
    viewingHistory: [],
    continueWatching: []
  }
}

export const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState: getInitialState(),
  reducers: {
    addToWatchlist: (state, action) => {
      const item = action.payload
      const exists = state.watchlist.find(
        (w) => w.id === item.id && w.mediaType === item.mediaType
      )
      if (!exists) {
        state.watchlist.push(item)
        localStorage.setItem('ott_user_profile', JSON.stringify(state))
      }
    },
    removeFromWatchlist: (state, action) => {
      state.watchlist = state.watchlist.filter(
        (w) => !(w.id === action.payload.id && w.mediaType === action.payload.mediaType)
      )
      localStorage.setItem('ott_user_profile', JSON.stringify(state))
    },
    addToFavorites: (state, action) => {
      const item = action.payload
      const exists = state.favorites.find(
        (f) => f.id === item.id && f.mediaType === item.mediaType
      )
      if (!exists) {
        state.favorites.push(item)
        localStorage.setItem('ott_user_profile', JSON.stringify(state))
      }
    },
    removeFromFavorites: (state, action) => {
      state.favorites = state.favorites.filter(
        (f) => !(f.id === action.payload.id && f.mediaType === action.payload.mediaType)
      )
      localStorage.setItem('ott_user_profile', JSON.stringify(state))
    },
    addToViewingHistory: (state, action) => {
      const item = action.payload
      // Remove if exists and add to beginning
      state.viewingHistory = state.viewingHistory.filter(
        (h) => !(h.id === item.id && h.mediaType === item.mediaType)
      )
      state.viewingHistory.unshift({
        ...item,
        watchedAt: new Date().toISOString()
      })
      // Keep only last 100 items
      if (state.viewingHistory.length > 100) {
        state.viewingHistory = state.viewingHistory.slice(0, 100)
      }
      localStorage.setItem('ott_user_profile', JSON.stringify(state))
    },
    updateContinueWatching: (state, action) => {
      const { id, mediaType, progress, duration } = action.payload
      const existing = state.continueWatching.find(
        (c) => c.id === id && c.mediaType === mediaType
      )
      if (existing) {
        existing.progress = progress
        existing.duration = duration
        existing.updatedAt = new Date().toISOString()
      } else {
        state.continueWatching.push({
          id,
          mediaType,
          progress,
          duration,
          updatedAt: new Date().toISOString()
        })
      }
      // Remove if progress is 90% or more
      state.continueWatching = state.continueWatching.filter(
        (c) => !(c.id === id && c.mediaType === mediaType) || (c.progress / c.duration) < 0.9
      )
      localStorage.setItem('ott_user_profile', JSON.stringify(state))
    },
    removeFromContinueWatching: (state, action) => {
      state.continueWatching = state.continueWatching.filter(
        (c) => !(c.id === action.payload.id && c.mediaType === action.payload.mediaType)
      )
      localStorage.setItem('ott_user_profile', JSON.stringify(state))
    },
    clearUserProfile: (state) => {
      state.watchlist = []
      state.favorites = []
      state.viewingHistory = []
      state.continueWatching = []
      localStorage.removeItem('ott_user_profile')
    }
  }
})

export const {
  addToWatchlist,
  removeFromWatchlist,
  addToFavorites,
  removeFromFavorites,
  addToViewingHistory,
  updateContinueWatching,
  removeFromContinueWatching,
  clearUserProfile
} = userProfileSlice.actions

export default userProfileSlice.reducer

