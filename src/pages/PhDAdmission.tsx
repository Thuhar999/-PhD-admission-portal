import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { DEPARTMENTS } from '@/data/departments'
import type { Application, Programme } from '@/types/application'
import { createServerApplication, loadDraft, saveDraft } from '@/utils/storage'

export function PhDAdmission() {
  const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(null)
  const [existingDraft, setExistingDraft] = useState<boolean>(false)
  const [draft, setDraft] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    void (async () => {
      const application = await loadDraft()
      if (application?.status === 'draft') {
        setDraft(application)
        setExistingDraft(true)
        setSelectedProgramme(application.selectedProgramme)
      }
      setLoading(false)
    })()
  }, [])

  const handleStart = async () => {
    if (!selectedProgramme) return
    setError('')
    setLoading(true)
    try {
      if (draft) {
        await saveDraft({ ...draft, selectedProgramme })
      } else {
        await createServerApplication(selectedProgramme)
      }
      navigate('/application')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the application draft.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartFresh = async () => {
    if (!selectedProgramme) return
    setError('')
    setLoading(true)
    try {
      await createServerApplication(selectedProgramme)
      navigate('/application')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create a new application.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-poppins bg-[#f8f9f6]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Header section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary-50 border border-primary-200/60 rounded-full text-xs font-semibold text-primary-800 mb-4">
            <Sparkles size={14} className="text-gold-500" />
            <span>Doctoral Programme Registration • 2026–27</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            REGISTRATION FORM
          </h1>
          <p className="text-sm font-semibold text-gray-600 mt-2 uppercase tracking-wide">
            ADMISSION FOR Ph.D. UNDER:
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Please select the academic discipline / department for your Ph.D. research programme.
          </p>
        </div>

        {/* Existing Draft Alert (if any) */}
        {existingDraft && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0">
                <RotateCcw size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900">Incomplete Draft Found</p>
                <p className="text-xs text-amber-700">
                  You have an unfinished application saved on the admissions server. You can resume or select a different department.
                </p>
              </div>
            </div>
            <button
              onClick={() => void handleStartFresh()}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline px-2 py-1"
            >
              Reset & Start New
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {error}
          </div>
        )}

        {/* 7 Selectable Programme Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {DEPARTMENTS.map((dept) => {
            const Icon = dept.icon
            const isSelected = selectedProgramme === dept.code

            return (
              <div
                key={dept.code}
                onClick={() => setSelectedProgramme(dept.code)}
                className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 bg-white flex flex-col justify-between group ${
                  isSelected
                    ? 'border-primary-700 bg-primary-50/40 shadow-md ring-2 ring-primary-100'
                    : 'border-gray-200 hover:border-primary-400 hover:shadow-md'
                }`}
              >
                {/* Checkmark when selected */}
                {isSelected && (
                  <div className="absolute top-3 right-3 text-primary-700">
                    <CheckCircle2 size={18} fill="currentColor" className="text-white" />
                  </div>
                )}

                <div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                    isSelected
                      ? 'bg-primary-700 text-white'
                      : 'bg-primary-50 text-primary-700 group-hover:bg-primary-100'
                  }`}>
                    <Icon size={20} />
                  </div>

                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                    Ph.D. Programme
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {dept.name}
                  </h3>

                  <p className="text-xs font-medium text-gray-600 line-clamp-2">
                    {dept.fullName}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Code: {dept.applicationCode}</span>
                  <span className={`font-semibold ${isSelected ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    {isSelected ? 'Selected' : 'Select'} →
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected Banner & CTA */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
              Selected Programme:
            </span>
            <div className="text-xl font-bold text-primary-800 flex items-center gap-2 mt-0.5">
              {selectedProgramme ? (
                <>
                  <span>Ph.D. – {selectedProgramme}</span>
                  <span className="text-xs font-normal text-gray-500">
                    ({DEPARTMENTS.find(d => d.code === selectedProgramme)?.fullName})
                  </span>
                </>
              ) : (
                <span className="text-gray-400 font-normal italic text-sm">
                  Please click on a department card above to select
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={!selectedProgramme || loading}
            onClick={() => void handleStart()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary-700 hover:bg-primary-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary-700 disabled:shadow-none flex-shrink-0"
          >
            <span>START APPLICATION</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
