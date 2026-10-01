import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, AlertTriangle, Send } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ApplicationDocument } from '@/components/ApplicationDocument'
import type { Application } from '@/types/application'
import { loadDraft } from '@/utils/storage'
import { submitApplication } from '@/services/api'

export function Review() {
  const navigate = useNavigate()
  const [app, setApp] = useState<Application | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    void (async () => {
      const draft = await loadDraft()
      if (!draft || !draft.selectedProgramme || draft.status !== 'draft') {
        navigate('/phd-admission')
        return
      }
      setApp(draft)
    })()
  }, [navigate])

  const handleConfirmSubmit = async () => {
    if (!app) return
    setIsSubmitting(true)
    try {
      await submitApplication(app.id)
      setIsSubmitting(false)
      setShowConfirmModal(false)
      navigate('/submitted')
    } catch (err) {
      setIsSubmitting(false)
      setShowConfirmModal(false)
      alert(err instanceof Error ? err.message : 'Could not submit the application.')
    }
  }

  if (!app) return null

  return (
    <div className="min-h-screen flex flex-col font-poppins bg-[#f8f9f6]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Review Top Banner */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-semibold mb-2">
              <AlertTriangle size={13} />
              Pre-Submission Document Preview
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Review Ph.D. Registration Application
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Please carefully verify all details below. This is an official non-editable preview of your registration form.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate('/application')}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition-colors shadow-xs"
            >
              <ArrowLeft size={14} /> BACK TO EDIT
            </button>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-6 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-semibold transition-all shadow-md hover:shadow-lg"
            >
              <Send size={14} /> CONFIRM & SUBMIT
            </button>
          </div>
        </div>

        {/* The Non-Editable Document View */}
        <div className="mb-8">
          <ApplicationDocument application={app} />
        </div>

        {/* Bottom Actions */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <button
            onClick={() => navigate('/application')}
            className="flex items-center gap-1.5 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={14} /> BACK TO EDIT
          </button>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-semibold transition-all shadow-md"
          >
            <CheckCircle2 size={14} /> CONFIRM & SUBMIT
          </button>
        </div>
      </main>

      {/* Confirmation Dialog Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Confirm Final Submission?
            </h3>

            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              Please verify all information before final confirmation. After confirmation, editing will no longer be available and your official Ph.D. registration application will be locked for departmental scrutiny.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void handleConfirmSubmit()}
                className="flex items-center gap-2 px-5 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={13} />
                    Confirm & Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
