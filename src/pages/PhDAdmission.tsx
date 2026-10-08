import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, CheckCircle2, RotateCcw, Sparkles, FileText,
  Printer, Hash, Calendar, User, BookOpen, Clock, PlusCircle
} from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { DEPARTMENTS } from '@/data/departments'
import type { Application, Programme } from '@/types/application'
import {
  createServerApplication,
  loadDraft,
  saveDraft,
  getMyApplications,
  saveCurrentApplication,
  clearDraft,
  formatDate,
} from '@/utils/storage'

export function PhDAdmission() {
  const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(null)
  const [submittedApps, setSubmittedApps] = useState<Application[]>([])
  const [draft, setDraft] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showNewSection, setShowNewSection] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    void (async () => {
      try {
        let apps = await getMyApplications()
        if (apps.length === 0) {
          const current = await loadDraft()
          if (current) apps = [current]
        }
        const submitted = apps.filter(item => item.status !== 'draft')
        const currentDraft = apps.find(item => item.status === 'draft') ?? null

        setSubmittedApps(submitted)
        if (currentDraft) {
          setDraft(currentDraft)
          setSelectedProgramme(currentDraft.selectedProgramme)
        }
      } catch (err) {
        console.error('Failed to load applications', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleStart = async () => {
    if (!selectedProgramme) return
    setError('')
    setLoading(true)
    try {
      if (draft && draft.status === 'draft') {
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
      clearDraft()
      setDraft(null)
      await createServerApplication(selectedProgramme)
      navigate('/application')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create a new application.')
    } finally {
      setLoading(false)
    }
  }

  const handleViewApplication = (app: Application, print = false) => {
    saveCurrentApplication(app)
    navigate(print ? '/application/view?print=true' : '/application/view')
  }

  const handleViewReceipt = (app: Application) => {
    saveCurrentApplication(app)
    navigate('/submitted')
  }

  const handleResumeDraft = (app: Application) => {
    saveCurrentApplication(app)
    navigate('/application')
  }

  const activeAppNumber = submittedApps[0]?.applicationNumber

  return (
    <div className="min-h-screen flex flex-col font-poppins bg-[#f8f9f6]">
      <Navbar applicationNumber={activeAppNumber} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Header section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary-50 border border-primary-200/60 rounded-full text-xs font-semibold text-primary-800 mb-4">
            <Sparkles size={14} className="text-gold-500" />
            <span>Doctoral Programme Registration • 2026–27</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            {submittedApps.length > 0 ? 'DOCTORAL CANDIDATE PORTAL' : 'REGISTRATION FORM'}
          </h1>
          <p className="text-sm font-semibold text-gray-600 mt-2 uppercase tracking-wide">
            {submittedApps.length > 0 ? 'Sahyadri Research Centre Dashboard' : 'ADMISSION FOR Ph.D. UNDER:'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {submittedApps.length > 0
              ? 'View and manage your registered Ph.D. applications, track status, or print official documents.'
              : 'Please select the academic discipline / department for your Ph.D. research programme.'}
          </p>
        </div>

        {/* ── SECTION: Submitted Applications Dashboard ── */}
        {submittedApps.length > 0 && (
          <div className="mb-10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <h2 className="text-lg font-bold text-gray-900">
                  My Ph.D. Applications ({submittedApps.length})
                </h2>
              </div>
              <span className="text-xs font-semibold text-primary-800 bg-primary-50 border border-primary-200/80 px-3 py-1 rounded-full">
                Active Candidate Record
              </span>
            </div>

            {submittedApps.map((app) => {
              const deptInfo = DEPARTMENTS.find(d => d.code === app.selectedProgramme)
              return (
                <div
                  key={app.id || app.applicationNumber}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-5"
                >
                  {/* Top Bar: Application Number, Department, Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-maroon-50 border border-maroon-200 rounded-lg text-maroon-800 text-xs font-mono font-bold">
                        <Hash size={13} className="text-maroon-700" />
                        <span>{app.applicationNumber}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        Ph.D. in {deptInfo?.fullName ?? app.selectedProgramme}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 font-bold text-xs rounded-full border border-green-200">
                        <CheckCircle2 size={13} />
                        SUBMITTED • UNDER REVIEW
                      </span>
                    </div>
                  </div>

                  {/* Candidate & Application Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-gray-400 font-medium flex items-center gap-1">
                        <User size={13} /> Research Scholar
                      </span>
                      <p className="font-bold text-gray-800 text-sm">{app.scholar.name || 'Scholar'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-gray-400 font-medium flex items-center gap-1">
                        <Calendar size={13} /> Submitted On
                      </span>
                      <p className="font-semibold text-gray-700">{formatDate(app.submittedAt || app.createdAt)}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-gray-400 font-medium flex items-center gap-1">
                        <BookOpen size={13} /> Study Mode
                      </span>
                      <p className="font-semibold text-primary-900">{app.scholar.studyMode || 'Full Time'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-gray-400 font-medium flex items-center gap-1">
                        <Clock size={13} /> Supervisor
                      </span>
                      <p className="font-semibold text-gray-700 truncate" title={app.supervisor.name}>
                        {app.supervisor.name || 'Research Centre Assigned'}
                      </p>
                    </div>
                  </div>

                  {/* Research Topic if available */}
                  {app.scholar.proposedResearchTopic && (
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs">
                      <span className="font-semibold text-gray-500 uppercase tracking-wide text-[10px] block mb-0.5">
                        Proposed Research Topic:
                      </span>
                      <p className="font-medium text-gray-800 italic">
                        "{app.scholar.proposedResearchTopic}"
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleViewApplication(app, false)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <FileText size={15} />
                      View Official Form
                    </button>

                    <button
                      type="button"
                      onClick={() => handleViewApplication(app, true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Printer size={15} />
                      Print A4 Document
                    </button>

                    <button
                      type="button"
                      onClick={() => handleViewReceipt(app)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <CheckCircle2 size={15} className="text-green-600" />
                      Submission Details
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Existing Draft Alert (if any draft in progress) */}
        {draft && draft.status === 'draft' && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0">
                <RotateCcw size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900">Incomplete Draft Found</p>
                <p className="text-xs text-amber-700">
                  You have an unfinished application in Ph.D. – {draft.selectedProgramme} (Step {draft.currentStep ?? 1} of 7).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleResumeDraft(draft)}
                className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Resume Draft
              </button>
              <button
                type="button"
                onClick={() => void handleStartFresh()}
                className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline px-1 py-1 cursor-pointer"
              >
                Discard & Start New
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {error}
          </div>
        )}

        {/* ── SECTION: Select Department / New Application ── */}
        <div className="mt-8">
          {submittedApps.length > 0 && (
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Register for Another Ph.D. Programme
                </h3>
                <p className="text-xs text-gray-500">
                  You can submit an additional application for another VTU-recognized research centre.
                </p>
              </div>
              {!showNewSection && (
                <button
                  type="button"
                  onClick={() => setShowNewSection(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-primary-700 text-primary-700 hover:bg-primary-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <PlusCircle size={14} />
                  Start New Application
                </button>
              )}
            </div>
          )}

          {/* Show cards if no submitted apps OR user opened new section */}
          {(submittedApps.length === 0 || showNewSection) && (
            <>
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

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {submittedApps.length > 0 && showNewSection && (
                    <button
                      type="button"
                      onClick={() => setShowNewSection(false)}
                      className="w-full sm:w-auto px-4 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={!selectedProgramme || loading}
                    onClick={() => void handleStart()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary-700 hover:bg-primary-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary-700 disabled:shadow-none flex-shrink-0 cursor-pointer"
                  >
                    <span>START APPLICATION</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
