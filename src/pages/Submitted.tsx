import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CheckCircle, FileText, Printer, Home, Calendar, User, BookOpen, Hash } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import type { Application } from '@/types/application'
import { loadDraft, formatDate } from '@/utils/storage'

export function Submitted() {
  const navigate = useNavigate()
  const [app, setApp] = useState<Application | null>(null)

  useEffect(() => {
    const data = loadDraft()
    if (!data || data.status !== 'submitted') {
      navigate('/phd-admission')
      return
    }
    setApp(data)
  }, [navigate])

  if (!app) return null

  return (
    <div className="min-h-screen flex flex-col font-poppins bg-[#f8f9f6]">
      <Navbar applicationNumber={app.applicationNumber} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden text-center">
          {/* Top Success Banner */}
          <div className="bg-primary-800 text-white py-10 px-6 relative overflow-hidden">
            <div className="w-20 h-20 rounded-full bg-white/10 text-white flex items-center justify-center mx-auto mb-4 border border-white/20">
              <CheckCircle size={44} className="text-gold-400" />
            </div>

            <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full uppercase tracking-wider mb-2">
              Registration Complete
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold">
              Application Submitted Successfully!
            </h1>

            <p className="text-xs text-white/80 max-w-md mx-auto mt-2 leading-relaxed">
              Your Ph.D. registration form has been formally recorded by the Sahyadri Research Centre.
            </p>
          </div>

          {/* Key Details Card */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-left space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                  <Hash size={15} className="text-primary-700" />
                  Application Number
                </div>
                <div className="text-xl font-bold font-mono text-maroon-700 tracking-wider">
                  {app.applicationNumber}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-gray-400 flex items-center gap-1.5 font-medium">
                    <User size={13} /> Applicant Name
                  </span>
                  <p className="font-bold text-gray-800 text-sm">{app.scholar.name}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 flex items-center gap-1.5 font-medium">
                    <BookOpen size={13} /> Selected Programme
                  </span>
                  <p className="font-bold text-primary-800 text-sm">Ph.D. – {app.selectedProgramme}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 flex items-center gap-1.5 font-medium">
                    <Calendar size={13} /> Submission Date
                  </span>
                  <p className="font-semibold text-gray-700">{formatDate(app.submittedAt || '')}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 font-medium">Application Status</span>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-green-100 text-green-800 font-bold rounded-full text-[11px]">
                      SUBMITTED
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/application/view"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-700 hover:bg-primary-800 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
              >
                <FileText size={15} />
                View Official Application
              </Link>

              <Link
                to="/application/view?print=true"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <Printer size={15} />
                Print A4 Application
              </Link>

              <Link
                to="/phd-admission"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
              >
                <Home size={15} />
                Portal Home
              </Link>
            </div>

            <p className="text-[11px] text-gray-400 pt-4 border-t border-gray-100">
              Please save a printed copy of the A4 registration document for institutional record and verification.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
