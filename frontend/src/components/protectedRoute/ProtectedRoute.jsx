import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Spinner } from '../'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth)
  const location = useLocation()

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <Spinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/authPage" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute

