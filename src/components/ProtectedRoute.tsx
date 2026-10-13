import { Navigate, Outlet } from 'react-router-dom'
import { getAuth } from '@/utils/storage'

interface Props {
  allowedRoles?: string[]
}

export function ProtectedRoute({ allowedRoles }: Props) {
  const auth = getAuth()

  // If user is not authenticated, redirect to login
  if (!auth || !auth.loggedIn) {
    return <Navigate to="/" replace />
  }

  // If specific roles are required, verify access
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (auth.role || 'APPLICANT').toUpperCase()
    const allowed = allowedRoles.map(r => r.toUpperCase())
    if (!allowed.includes(userRole)) {
      // If staff user attempts to view applicant page, or applicant attempts to view admin
      if (userRole === 'ADMIN' || userRole === 'REVIEWER') {
        return <Navigate to="/admin" replace />
      }
      return <Navigate to="/phd-admission" replace />
    }
  }

  return <Outlet />
}
