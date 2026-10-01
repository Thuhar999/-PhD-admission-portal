import type { Application, ScholarDetails, SupervisorDetails, CoSupervisorDetails } from '@/types/application'
import { AUTH_KEY } from '@/data/departments'
import { createApplication, getApplication, getMyApplications, saveApplication } from '@/services/api'

const APPLICATION_ID_KEY = 'phd_admission_current_application_id'

// ─── Storage ─────────────────────────────────────────────────────────────────
export async function saveDraft(app: Application): Promise<Application> {
  const saved = await saveApplication(app)
  localStorage.setItem(APPLICATION_ID_KEY, saved.id)
  return saved
}

export async function loadDraft(): Promise<Application | null> {
  if (!getAuth()?.accessToken) return null

  try {
    const applicationId = localStorage.getItem(APPLICATION_ID_KEY)
    if (applicationId) return await getApplication(applicationId)

    const applications = await getMyApplications()
    const application = applications.find((item) => item.status === 'draft') ?? applications[0] ?? null
    if (application) localStorage.setItem(APPLICATION_ID_KEY, application.id)
    return application
  } catch {
    return null
  }
}

export function clearDraft(): void {
  localStorage.removeItem(APPLICATION_ID_KEY)
}

export function saveCurrentApplication(application: Application): void {
  localStorage.setItem(APPLICATION_ID_KEY, application.id)
}

export async function createServerApplication(selectedProgramme: Application['selectedProgramme']): Promise<Application> {
  const application = await createApplication(selectedProgramme)
  saveCurrentApplication(application)
  return application
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export function saveAuth(email: string, accessToken: string, role: string): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ email, loggedIn: true, accessToken, role }))
}

export function getAuth(): { email: string; loggedIn: boolean; accessToken?: string; role?: string } | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY)
  clearDraft()
}

// ─── Validation ───────────────────────────────────────────────────────────────
export interface ValidationErrors {
  [key: string]: string
}

export function validateScholar(scholar: ScholarDetails): ValidationErrors {
  const errors: ValidationErrors = {}
  if (!scholar.name.trim()) errors.name = 'Name is required'
  if (!scholar.email.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(scholar.email)) errors.email = 'Enter a valid email address'
  if (!scholar.contactNumber.trim()) errors.contactNumber = 'Contact number is required'
  else if (!/^[0-9+\-\s()]{7,15}$/.test(scholar.contactNumber)) errors.contactNumber = 'Enter a valid contact number'
  if (!scholar.proposedResearchTopic.trim()) errors.proposedResearchTopic = 'Proposed research topic is required'
  if (!scholar.profession.trim()) errors.profession = 'Profession is required'
  if (!scholar.fatherGuardianSpouseName.trim()) errors.fatherGuardianSpouseName = "Father/Guardian/Spouse name is required"
  if (!scholar.studyMode) errors.studyMode = 'Please select Part Time or Full Time'
  if (!scholar.addressForCommunication.trim()) errors.addressForCommunication = 'Address is required'
  return errors
}

export function validateSupervisor(supervisor: SupervisorDetails): ValidationErrors {
  const errors: ValidationErrors = {}
  if (!supervisor.name.trim()) errors.name = 'Supervisor name is required'
  if (!supervisor.email.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supervisor.email)) errors.email = 'Enter a valid email address'
  if (!supervisor.contactNumber.trim()) errors.contactNumber = 'Contact number is required'
  if (!supervisor.profession.trim()) errors.profession = 'Profession is required'
  if (!supervisor.addressOfInstitution.trim()) errors.addressOfInstitution = 'Address of institution is required'
  return errors
}

export function formatTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins === 1) return '1 minute ago'
  if (mins < 60) return `${mins} minutes ago`
  const hrs = Math.floor(mins / 60)
  if (hrs === 1) return '1 hour ago'
  return `${hrs} hours ago`
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onload = () => res(reader.result as string)
    reader.onerror = rej
    reader.readAsDataURL(file)
  })
}

export function formatDate(isoString: string): string {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}
