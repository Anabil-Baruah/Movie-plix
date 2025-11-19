import { configureStore } from '@reduxjs/toolkit'
import homeSlice from './homeSlice'
import authSlice from './authSlice'
import userProfileSlice from './userProfileSlice'

export const store = configureStore({
  reducer: {
    home: homeSlice,
    auth: authSlice,
    userProfile: userProfileSlice,
  },
})