import { Navigate } from 'react-router-dom'
import { getAuth } from '../utils/auth'

function ProtectedRoute({ children, allowedRoles, redirectTo = '/login' }) {
  const auth = getAuth()

  if (!auth) {
    return <Navigate to={redirectTo} replace />
  }

  if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute