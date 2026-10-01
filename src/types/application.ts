// ============================================================
// TypeScript interfaces for PhD Admission Application
// ============================================================

export type Programme = 'CSE' | 'EC' | 'CHEM' | 'PHY' | 'Maths' | 'MBA' | 'ME'

export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'needs_information' | 'approved' | 'rejected'

export interface ScholarDetails {
  name: string
  email: string
  contactNumber: string
  whatsapp: string
  proposedResearchTopic: string
  profession: string
  fatherGuardianSpouseName: string
  alternateNumber: string
  studyMode: 'Part Time' | 'Full Time' | ''
  addressForCommunication: string
}

export interface SupervisorDetails {
  name: string
  email: string
  contactNumber: string
  whatsapp: string
  profession: string
  addressOfInstitution: string
  addressForCommunication: string
}

export interface CoSupervisorDetails {
  hasCoSupervisor: boolean
  name: string
  email: string
  contactNumber: string
  whatsapp: string
  profession: string
  addressOfInstitution: string
  addressForCommunication: string
}

export interface Qualification {
  id: string
  degree: string
  university: string
  percentage: string
}

export interface DocumentInfo {
  id: string
  slNo: number
  name: string
  optional: boolean
  fileName?: string
  fileData?: string  // base64
  status: 'pending' | 'uploaded'
}

export interface FeePayment {
  id: string
  academicYear: string
  date: string
  amount: string
  modeOfPayment: string
  details: string
}

export interface Declaration {
  agreed: boolean
  date: string
}

export interface Signature {
  type: 'drawn' | 'uploaded' | 'none'
  data?: string  // base64 PNG
}

export interface Application {
  id: string
  applicationNumber: string
  selectedProgramme: Programme
  status: ApplicationStatus
  currentStep?: FormStep
  photograph?: string  // base64
  scholar: ScholarDetails
  supervisor: SupervisorDetails
  coSupervisor: CoSupervisorDetails
  qualifications: Qualification[]
  documents: DocumentInfo[]
  feePayments: FeePayment[]
  declaration: Declaration
  signature: Signature
  createdAt: string
  updatedAt: string
  submittedAt?: string
}

// Form step type
export type FormStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export interface StepInfo {
  step: FormStep
  label: string
  shortLabel: string
}
