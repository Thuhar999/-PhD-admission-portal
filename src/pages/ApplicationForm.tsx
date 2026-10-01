import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Save, Eye } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { CollegeHeader } from '@/components/CollegeHeader'
import { ProgressStepper } from '@/components/ProgressStepper'
import { PhotoUpload } from '@/components/PhotoUpload'
import { ScholarDetailsStep } from '@/components/ScholarDetails'
import { SupervisorDetailsStep } from '@/components/SupervisorDetails'
import { CoSupervisorDetailsStep } from '@/components/CoSupervisorDetails'
import { QualificationTableStep } from '@/components/QualificationTable'
import { DocumentUploadTableStep } from '@/components/DocumentUploadTable'
import { FeeDetailsTableStep } from '@/components/FeeDetailsTable'
import { DeclarationStep } from '@/components/DeclarationStep'

import type { Application, FormStep } from '@/types/application'
import {
  loadDraft,
  saveDraft,
  validateScholar,
  validateSupervisor,
  formatTime,
  type ValidationErrors,
} from '@/utils/storage'

export function ApplicationForm() {
  const navigate = useNavigate()
  const [app, setApp] = useState<Application | null>(null)
  const [currentStep, setCurrentStep] = useState<FormStep>(1)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [lastSaved, setLastSaved] = useState<string>('just now')
  const [showSaveToast, setShowSaveToast] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Ensure user has an application/programme selected
  useEffect(() => {
    void (async () => {
      const existing = await loadDraft()
      if (!existing || !existing.selectedProgramme || existing.status !== 'draft') {
        navigate('/phd-admission')
        return
      }
      setApp(existing)
      setCurrentStep(Math.min(7, Math.max(1, existing.currentStep ?? 1)) as FormStep)
    })()
  }, [navigate])

  // Update last saved text
  useEffect(() => {
    if (!app) return
    const interval = setInterval(() => {
      setLastSaved(formatTime(app.updatedAt))
    }, 15000)
    return () => clearInterval(interval)
  }, [app])

  const handleSaveDraft = async (silent = false, application = app, step = currentStep) => {
    if (!application) return false
    setSaveError('')
    try {
      const saved = await saveDraft({ ...application, currentStep: step })
      setApp(saved)
      setLastSaved('just now')
      if (!silent) {
        setShowSaveToast(true)
        setTimeout(() => setShowSaveToast(false), 2500)
      }
      return true
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save your draft to the server.')
      return false
    }
  }

  // Step Validation
  const validateCurrentStep = (): boolean => {
    if (!app) return false
    setErrors({})
    if (currentStep === 1) {
      const errs = validateScholar(app.scholar)
      if (Object.keys(errs).length > 0) {
        setErrors(errs)
        return false
      }
    }
    if (currentStep === 2) {
      const errs = validateSupervisor(app.supervisor)
      if (Object.keys(errs).length > 0) {
        setErrors(errs)
        return false
      }
    }
    if (currentStep === 5) {
      // Check required documents (excluding optional)
      const missing = app.documents.some(d => !d.optional && d.status !== 'uploaded')
      if (missing) {
        setErrors({ documents: 'Please upload all mandatory documents before proceeding.' })
        return false
      }
    }
    if (currentStep === 7) {
      if (!app.declaration.agreed) {
        setErrors({ declaration: 'You must confirm the declaration to proceed.' })
        return false
      }
      if (!app.signature.data) {
        setErrors({ signature: 'Please provide applicant signature.' })
        return false
      }
    }
    return true
  }

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      window.scrollTo({ top: 150, behavior: 'smooth' })
      return
    }
    const nextStep = currentStep < 7 ? (currentStep + 1) as FormStep : currentStep
    if (!(await handleSaveDraft(true, app, nextStep))) return
    if (currentStep < 7) {
      setCurrentStep(nextStep)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Proceed to review page
      navigate('/review')
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as FormStep)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (!app) {
    return (
      <div className="min-h-screen flex items-center justify-center font-poppins bg-[#f8f9f6] text-sm text-gray-600">
        Loading your application from the server…
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col font-poppins bg-[#f8f9f6]">
      <Navbar draftSavedTime={lastSaved} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Top College Header Box */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xs p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full">
              <CollegeHeader programme={app.selectedProgramme} />
            </div>
            {/* Top Right Photo Box */}
            <div className="flex-shrink-0 pt-2 md:pt-0">
              <PhotoUpload
                value={app.photograph}
                onChange={photo => {
                  const updated = { ...app, photograph: photo }
                  setApp(updated)
                  void handleSaveDraft(true, updated)
                }}
              />
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-white border border-gray-200 rounded-xl mb-6 shadow-xs">
          <ProgressStepper
            currentStep={currentStep}
            onStepClick={(step) => {
              if (step < currentStep) {
                setCurrentStep(step)
              }
            }}
          />
        </div>

        {/* Save Draft Toast */}
        {showSaveToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-primary-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 border border-primary-700 animate-bounce">
            <span>✓ Draft Saved Successfully</span>
          </div>
        )}

        {saveError && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {saveError}
          </div>
        )}

        {/* Main Step Form Area */}
        <div className="mb-6">
          {currentStep === 1 && (
            <ScholarDetailsStep
              data={app.scholar}
              onChange={scholar => setApp({ ...app, scholar })}
              errors={errors}
            />
          )}

          {currentStep === 2 && (
            <SupervisorDetailsStep
              data={app.supervisor}
              onChange={supervisor => setApp({ ...app, supervisor })}
              errors={errors}
            />
          )}

          {currentStep === 3 && (
            <CoSupervisorDetailsStep
              data={app.coSupervisor}
              onChange={coSupervisor => setApp({ ...app, coSupervisor })}
            />
          )}

          {currentStep === 4 && (
            <QualificationTableStep
              data={app.qualifications}
              onChange={qualifications => setApp({ ...app, qualifications })}
            />
          )}

          {currentStep === 5 && (
            <div className="space-y-3">
              <DocumentUploadTableStep
                data={app.documents}
                onChange={documents => setApp({ ...app, documents })}
              />
              {errors.documents && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {errors.documents}
                </div>
              )}
            </div>
          )}

          {currentStep === 6 && (
            <FeeDetailsTableStep
              data={app.feePayments}
              onChange={feePayments => setApp({ ...app, feePayments })}
            />
          )}

          {currentStep === 7 && (
            <div className="space-y-3">
              <DeclarationStep
                declaration={app.declaration}
                signature={app.signature}
                onDeclarationChange={declaration => setApp({ ...app, declaration })}
                onSignatureChange={signature => setApp({ ...app, signature })}
                error={errors.declaration || errors.signature}
              />
            </div>
          )}
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={14} /> BACK
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/phd-admission')}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-500 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={14} /> CHANGE PROGRAMME
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void handleSaveDraft(false)}
              className="flex items-center gap-1.5 px-4 py-2 border border-primary-700 text-primary-700 rounded-lg text-xs font-semibold hover:bg-primary-50 transition-colors"
            >
              <Save size={14} /> SAVE DRAFT
            </button>

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={() => void handleNext()}
                className="flex items-center gap-1.5 px-6 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                NEXT <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleNext()}
                className="flex items-center gap-1.5 px-6 py-2 bg-maroon-700 hover:bg-maroon-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <Eye size={14} /> REVIEW APPLICATION
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
