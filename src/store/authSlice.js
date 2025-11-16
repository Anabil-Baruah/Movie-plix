import { createSlice } from '@reduxjs/toolkit'

// Load initial state from localStorage
const getInitialState = () => {
  try {
    const storedUser = localStorage.getItem('ott_user')
    const storedToken = localStorage.getItem('ott_token')
    if (storedUser && storedToken) {
      return {
        user: JSON.parse(storedUser),
        token: storedToken,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }
    }
  } catch (error) {
    console.error('Error loading auth state from localStorage:', error)
  }
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  }
}

export const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      state.isLoading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.error = null
      
      // Persist to localStorage
      localStorage.setItem('ott_user', JSON.stringify(action.payload.user))
      localStorage.setItem('ott_token', action.payload.token)
    },
    loginFailure: (state, action) => {
      state.isLoading = false
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      
      // Clear localStorage
      localStorage.removeItem('ott_user')
      localStorage.removeItem('ott_token')
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      // Ensure preferences are properly merged
      if (action.payload.preferences) {
        state.user.preferences = { ...state.user.preferences, ...action.payload.preferences }
      }
      localStorage.setItem('ott_user', JSON.stringify(state.user))
    },
    clearError: (state) => {
      state.error = null
    }
  }
})

export const { loginStart, loginSuccess, loginFailure, logout, updateUser, clearError } = authSlice.actions

export default authSlice.reducer

