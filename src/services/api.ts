import type { Application, ApplicationStatus, DocumentInfo, Programme, Signature } from '@/types/application'

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')
const AUTH_KEY = 'phd_admission_auth'

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
    photograph,
    signature: toSignature(application.signature.type, signatureData),
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
  login: (email: string, password: string) => request<AuthResponse>('/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password }),
  }),
  register: (email: string, password: string) => request<AuthResponse>('/auth/register', {
    method: 'POST', body: JSON.stringify({ email, password }),
  }),
}

export async function createApplication(selectedProgramme: Programme) {
  return normaliseApplication(await request<ServerApplication>('/applications', {
    method: 'POST', body: JSON.stringify({ selectedProgramme }),
  }))
}

export async function getApplication(applicationId: string) {
  return normaliseApplication(await request<ServerApplication>(`/applications/${applicationId}`))
}

export async function getMyApplications() {
  const applications = await request<ServerApplication[]>('/applications/mine')
  return Promise.all(applications.map(normaliseApplication))
}

export async function saveApplication(application: Application) {
  const server = await request<ServerApplication>(`/applications/${application.id}`, {
    method: 'PATCH', body: JSON.stringify(draftPayload(application)),
  })
  await synchroniseFiles(application, server)
  return getApplication(application.id)
}

export async function submitApplication(applicationId: string) {
  return normaliseApplication(await request<ServerApplication>(`/applications/${applicationId}/submit`, { method: 'POST' }))
}
