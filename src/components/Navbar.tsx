import { Link, useNavigate } from 'react-router-dom'
import { LogOut, GraduationCap, CheckCircle2 } from 'lucide-react'
import { getAuth, clearAuth } from '@/utils/storage'

interface Props {
  draftSavedTime?: string
  applicationNumber?: string
}

export function Navbar({ draftSavedTime, applicationNumber }: Props) {
  const navigate = useNavigate()
  const auth = getAuth()

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  return (
    <header className="app-nav bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Branding */}
        <Link to={auth ? "/phd-admission" : "/"} className="flex items-center gap-3">
          <img
            src="/sahyadri-logo.png"
            alt="Sahyadri Logo"
            className="h-11 w-auto object-contain"
          />
          <div>
            <div className="font-bold text-primary-800 text-sm leading-tight tracking-wider">
              SAHYADRI
            </div>
            <div className="text-[11px] font-semibold text-gray-500 leading-tight">
              Ph.D. Admission Portal
            </div>
          </div>
        </Link>

        {/* Right: Info & Actions */}
        <div className="flex items-center gap-4">
          {draftSavedTime && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
              <CheckCircle2 size={13} />
              <span>Draft Saved ({draftSavedTime})</span>
            </div>
          )}

          {applicationNumber && (
            <div className="text-xs font-semibold px-2.5 py-1 bg-primary-50 text-primary-800 rounded border border-primary-200">
              App #{applicationNumber}
            </div>
          )}

          {auth ? (
            <div className="flex items-center gap-3">
              <span className="hidden md:inline-block text-xs font-medium text-gray-600">
                {auth.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-gray-200"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-primary-700 hover:bg-primary-800 rounded-lg transition-colors"
            >
              <GraduationCap size={15} />
              Portal Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
