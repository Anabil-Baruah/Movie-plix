import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/authSlice'
import { clearUserProfile } from '../store/userProfileSlice'
import { useNavigate } from 'react-router-dom'

/**
 * Custom hook for authentication
 * Provides easy access to auth state and common auth operations
 */
export const useAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, token, error } = useSelector(
    (state) => state.auth
  )

  const handleLogout = () => {
    dispatch(logout())
    dispatch(clearUserProfile())
    navigate('/')
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    token,
    error,
    logout: handleLogout
  }
}

