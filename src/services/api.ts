import type { Application, DocumentInfo, Programme, Signature } from '@/types/application'
import { REQUIRED_DOCUMENTS } from '@/data/departments'

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')
const AUTH_KEY = 'phd_admission_auth'
const LOCAL_STORAGE_APP_KEY = 'phd_admission_draft'
const APPLICATION_ID_KEY = 'phd_admission_current_application_id'

interface StoredSession {
  email: string
  loggedIn: boolean
  accessToken?: string
  role?: string
}

interface AuthResponse {
  accessToken: string
  user: { id: string; email: string; role: string }
}

type ServerDocument = Omit<DocumentInfo, 'fileData'> & { downloadUrl: string | null }
type ServerApplication = Omit<Application, 'photograph' | 'signature' | 'documents' | 'currentStep'> & {
  currentStep: number
  photographUrl: string | null
  signature: { type: string; url?: string }
  documents: ServerDocument[]
}

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

function accessToken() {
  try {
    return (JSON.parse(localStorage.getItem(AUTH_KEY) ?? '{}') as StoredSession).accessToken
  } catch {
    return undefined
  }
}

function url(path: string) {
  return path.startsWith('http') ? path : `${API_URL}${path}`
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = accessToken()
  const response = await fetch(url(path), {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string | string[] } | null
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message
    throw new ApiError(message ?? 'The server could not complete the request.', response.status)
  }

  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}

// ─── Local / Offline Storage Helpers ──────────────────────────────────────────

export function generateAppNumber(programme: string): string {
  const code = (programme || 'CSE').toUpperCase().replace(/\s/g, '')
  const year = new Date().getFullYear()
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `PHD${code}${year}${rand}`
}

export function createDefaultApplication(programme: Programme = 'CSE'): Application {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `app-${Date.now()}`,
    applicationNumber: '',
    selectedProgramme: programme,
    status: 'draft',
    photograph: undefined,
    scholar: {
      name: '',
      email: '',
      contactNumber: '',
      whatsapp: '',
      proposedResearchTopic: '',
      profession: '',
      fatherGuardianSpouseName: '',
      alternateNumber: '',
      studyMode: '',
      addressForCommunication: '',
    },
    supervisor: {
      name: '',
      email: '',
      contactNumber: '',
      whatsapp: '',
      profession: '',
      addressOfInstitution: '',
      addressForCommunication: '',
    },
    coSupervisor: {
      hasCoSupervisor: false,
      name: '',
      email: '',
      contactNumber: '',
      whatsapp: '',
      profession: '',
      addressOfInstitution: '',
      addressForCommunication: '',
    },
    qualifications: [
      { id: '1', degree: '', university: '', percentage: '' },
      { id: '2', degree: '', university: '', percentage: '' },
    ],
    documents: REQUIRED_DOCUMENTS.map((d) => ({ ...d, status: 'pending' as const })),
    feePayments: [{ id: '1', academicYear: '', date: '', amount: '', modeOfPayment: '', details: '' }],
    declaration: { agreed: false, date: '' },
    signature: { type: 'none' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

const LOCAL_STORAGE_ALL_KEY = 'phd_admission_all_applications'

export function getLocalDraft(): Application | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_APP_KEY)
    return raw ? (JSON.parse(raw) as Application) : null
  } catch {
    return null
  }
}

export function getAllLocalApplications(): Application[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ALL_KEY)
    if (raw) return JSON.parse(raw) as Application[]
  } catch {
    // fallback
  }
  const single = getLocalDraft()
  return single ? [single] : []
}

export function saveLocalDraft(app: Application): Application {
  try {
    app.updatedAt = new Date().toISOString()
    localStorage.setItem(LOCAL_STORAGE_APP_KEY, JSON.stringify(app))
    localStorage.setItem(APPLICATION_ID_KEY, app.id)

    const all = getAllLocalApplications()
    const index = all.findIndex((a) => a.id === app.id)
    if (index >= 0) {
      all[index] = app
    } else {
      all.unshift(app)
    }
    localStorage.setItem(LOCAL_STORAGE_ALL_KEY, JSON.stringify(all))
  } catch (e) {
    console.warn('Could not save to localStorage', e)
  }
  return app
}

async function protectedObjectUrl(path: string) {
  const token = accessToken()
  const response = await fetch(url(path), { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  if (!response.ok) return undefined
  return URL.createObjectURL(await response.blob())
}

function isDataUrl(value?: string) {
  return Boolean(value?.startsWith('data:'))
}

async function dataUrlToFile(dataUrl: string, fileName: string) {
  const blob = await (await fetch(dataUrl)).blob()
  return new File([blob], fileName, { type: blob.type })
}

function toSignature(type: string, data?: string): Signature {
  if (type === 'drawn' || type === 'uploaded') return data ? { type, data } : { type }
  return { type: 'none' }
}

async function normaliseApplication(application: ServerApplication): Promise<Application> {
  const [photograph, signatureData] = await Promise.all([
    application.photographUrl ? protectedObjectUrl(application.photographUrl) : Promise.resolve(undefined),
    application.signature.url ? protectedObjectUrl(application.signature.url) : Promise.resolve(undefined),
  ])

  return {
    ...application,
    currentStep: Math.min(8, Math.max(1, application.currentStep)) as Application['currentStep'],
    photograph: photograph ?? (application as unknown as Application).photograph,
    signature: toSignature(application.signature.type, signatureData ?? (application.signature as unknown as Signature).data),
    documents: application.documents.map(({ downloadUrl: _downloadUrl, ...document }) => document),
  }
}

function draftPayload(application: Application) {
  return {
    selectedProgramme: application.selectedProgramme,
    currentStep: application.currentStep ?? 1,
    scholar: application.scholar,
    supervisor: application.supervisor,
    coSupervisor: application.coSupervisor,
    qualifications: application.qualifications.map(({ degree, university, percentage }) => ({ degree, university, percentage })),
    feePayments: application.feePayments.map(({ academicYear, date, amount, modeOfPayment, details }) => ({
      academicYear, date: date || undefined, amount, modeOfPayment, details,
    })),
    declaration: { ...application.declaration, date: application.declaration.date || undefined },
  }
}

async function upload(path: string, file: File, fields?: Record<string, string>) {
  const body = new FormData()
  body.append('file', file)
  Object.entries(fields ?? {}).forEach(([key, value]) => body.append(key, value))
  return request(path, { method: 'POST', body })
}

async function synchroniseFiles(application: Application, server: ServerApplication) {
  if (isDataUrl(application.photograph)) {
    await upload(`/applications/${application.id}/photo`, await dataUrlToFile(application.photograph!, 'photograph.png'))
  } else if (!application.photograph && server.photographUrl) {
    await request(`/applications/${application.id}/photo`, { method: 'DELETE' })
  }

  if (isDataUrl(application.signature.data)) {
    await upload(
      `/applications/${application.id}/signature`,
      await dataUrlToFile(application.signature.data!, 'signature.png'),
      { type: application.signature.type.toUpperCase() },
    )
  } else if (application.signature.type === 'none' && server.signature.url) {
    await request(`/applications/${application.id}/signature`, { method: 'DELETE' })
  }

  await Promise.all(application.documents.map(async (document) => {
    const serverDocument = server.documents.find((item) => item.id === document.id)
    if (!serverDocument) return
    if (isDataUrl(document.fileData)) {
      await upload(
        `/applications/${application.id}/documents/${document.id}/file`,
        await dataUrlToFile(document.fileData!, document.fileName ?? `${document.name}.pdf`),
      )
    } else if (document.status === 'pending' && serverDocument.status === 'uploaded') {
      await request(`/applications/${application.id}/documents/${document.id}/file`, { method: 'DELETE' })
    }
  }))
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      return await request<AuthResponse>('/auth/login', {
        method: 'POST', body: JSON.stringify({ email, password }),
      })
    } catch (err) {
      if (err instanceof ApiError) throw err
      console.info('[PhD Portal] Backend server offline. Activated demo/offline session.')
      return {
        accessToken: 'offline-demo-token',
        user: { id: 'demo-user-1', email, role: 'APPLICANT' },
      }
    }
  },
  register: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      return await request<AuthResponse>('/auth/register', {
        method: 'POST', body: JSON.stringify({ email, password }),
      })
    } catch (err) {
      if (err instanceof ApiError) throw err
      console.info('[PhD Portal] Backend server offline. Registered demo/offline applicant.')
      return {
        accessToken: 'offline-demo-token',
        user: { id: 'demo-user-1', email, role: 'APPLICANT' },
      }
    }
  },
}

export async function createApplication(selectedProgramme: Programme): Promise<Application> {
  try {
    return await normaliseApplication(await request<ServerApplication>('/applications', {
      method: 'POST', body: JSON.stringify({ selectedProgramme }),
    }))
  } catch (err) {
    if (err instanceof ApiError) throw err
    console.info('[PhD Portal] Backend offline. Created local application draft.')
    const draft = createDefaultApplication(selectedProgramme)
    return saveLocalDraft(draft)
  }
}

export async function getApplication(applicationId: string): Promise<Application> {
  try {
    return await normaliseApplication(await request<ServerApplication>(`/applications/${applicationId}`))
  } catch (err) {
    if (err instanceof ApiError) throw err
    const all = getAllLocalApplications()
    const found = all.find((a) => a.id === applicationId)
    if (found) return found
    const local = getLocalDraft()
    if (local) return local
    throw err
  }
}

export async function getMyApplications(): Promise<Application[]> {
  try {
    const applications = await request<ServerApplication[]>('/applications/mine')
    return Promise.all(applications.map(normaliseApplication))
  } catch (err) {
    if (err instanceof ApiError) throw err
    return getAllLocalApplications()
  }
}

export async function saveApplication(application: Application): Promise<Application> {
  try {
    const server = await request<ServerApplication>(`/applications/${application.id}`, {
      method: 'PATCH', body: JSON.stringify(draftPayload(application)),
    })
    await synchroniseFiles(application, server)
    return await getApplication(application.id)
  } catch (err) {
    if (err instanceof ApiError) throw err
    console.info('[PhD Portal] Backend offline. Draft saved to browser storage.')
    return saveLocalDraft(application)
  }
}

export async function submitApplication(applicationId: string): Promise<Application> {
  try {
    return await normaliseApplication(await request<ServerApplication>(`/applications/${applicationId}/submit`, { method: 'POST' }))
  } catch (err) {
    if (err instanceof ApiError) throw err
    console.info('[PhD Portal] Backend offline. Submitting application locally.')
    const all = getAllLocalApplications()
    let target = all.find((a) => a.id === applicationId) ?? getLocalDraft()
    if (!target) {
      target = { id: applicationId, selectedProgramme: 'CSE' } as Application
    }
    target.status = 'submitted'
    target.submittedAt = new Date().toISOString()
    if (!target.applicationNumber) {
      target.applicationNumber = generateAppNumber(target.selectedProgramme || 'CSE')
    }
    saveLocalDraft(target)
    return target
  }
}
