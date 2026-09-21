import type { Application, ScholarDetails, SupervisorDetails, CoSupervisorDetails } from '@/types/application'
import { REQUIRED_DOCUMENTS, STORAGE_KEY, AUTH_KEY } from '@/data/departments'

// ─── Storage ─────────────────────────────────────────────────────────────────
export function saveDraft(app: Application): void {
  app.updatedAt = new Date().toISOString()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(app))
}

export function loadDraft(): Application | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Application) : null
  } catch {
    return null
  }
}

export function clearDraft(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export function saveAuth(email: string): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ email, loggedIn: true }))
}

export function getAuth(): { email: string; loggedIn: boolean } | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY)
}

// ─── Application Number ───────────────────────────────────────────────────────
export function generateAppNumber(programme: string): string {
  const code = programme.toUpperCase().replace(/\s/g, '')
  const year = new Date().getFullYear()
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `PHD${code}${year}${rand}`
}

// ─── Default Application ──────────────────────────────────────────────────────
export function createDefaultApplication(): Application {
  return {
    id: crypto.randomUUID(),
    applicationNumber: '',
    selectedProgramme: 'CSE',
    status: 'draft',
    photograph: undefined,
    scholar: {
      name: '', email: '', contactNumber: '', whatsapp: '',
      proposedResearchTopic: '', profession: '', fatherGuardianSpouseName: '',
      alternateNumber: '', studyMode: '', addressForCommunication: '',
    },
    supervisor: {
      name: '', email: '', contactNumber: '', whatsapp: '',
      profession: '', addressOfInstitution: '', addressForCommunication: '',
    },
    coSupervisor: {
      hasCoSupervisor: false,
      name: '', email: '', contactNumber: '', whatsapp: '',
      profession: '', addressOfInstitution: '', addressForCommunication: '',
    },
    qualifications: [
      { id: '1', degree: '', university: '', percentage: '' },
      { id: '2', degree: '', university: '', percentage: '' },
    ],
    documents: REQUIRED_DOCUMENTS.map(d => ({ ...d, status: 'pending' as const })),
    feePayments: [{ id: '1', academicYear: '', date: '', amount: '', modeOfPayment: '', details: '' }],
    declaration: { agreed: false, date: '' },
    signature: { type: 'none' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
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
