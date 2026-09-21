import type { Programme, StepInfo, DocumentInfo } from '@/types/application'
import { Cpu, Radio, FlaskConical, Atom, Calculator, Briefcase, Settings } from 'lucide-react'

export interface DepartmentCard {
  code: Programme
  name: string
  fullName: string
  icon: typeof Cpu
  applicationCode: string
}

export const DEPARTMENTS: DepartmentCard[] = [
  { code: 'CSE',   name: 'CSE',   fullName: 'Computer Science & Engineering', icon: Cpu,          applicationCode: 'PHDCSE' },
  { code: 'EC',    name: 'EC',    fullName: 'Electronics & Communication',     icon: Radio,        applicationCode: 'PHDEC'  },
  { code: 'CHEM',  name: 'CHEM',  fullName: 'Chemistry',                       icon: FlaskConical, applicationCode: 'PHDCHEM'},
  { code: 'PHY',   name: 'PHY',   fullName: 'Physics',                         icon: Atom,         applicationCode: 'PHDPHY' },
  { code: 'Maths', name: 'Maths', fullName: 'Mathematics',                     icon: Calculator,   applicationCode: 'PHDMATHS'},
  { code: 'MBA',   name: 'MBA',   fullName: 'Business Administration',         icon: Briefcase,    applicationCode: 'PHDMBA' },
  { code: 'ME',    name: 'ME',    fullName: 'Mechanical Engineering',           icon: Settings,     applicationCode: 'PHDME'  },
]

export const FORM_STEPS: StepInfo[] = [
  { step: 1, label: 'Scholar Details',      shortLabel: 'Scholar'      },
  { step: 2, label: 'Supervisor Details',   shortLabel: 'Supervisor'   },
  { step: 3, label: 'Co-Supervisor',        shortLabel: 'Co-Supervisor'},
  { step: 4, label: 'Qualification',        shortLabel: 'Qualification'},
  { step: 5, label: 'Documents',            shortLabel: 'Documents'    },
  { step: 6, label: 'Fee Details',          shortLabel: 'Fee Details'  },
  { step: 7, label: 'Declaration',          shortLabel: 'Declaration'  },
  { step: 8, label: 'Review',               shortLabel: 'Review'       },
]

export const REQUIRED_DOCUMENTS: Omit<DocumentInfo, 'status'>[] = [
  { id: 'doc1', slNo: 1, name: 'UG Convocation Certificate',   optional: false },
  { id: 'doc2', slNo: 2, name: 'PG Marks Card',                optional: false },
  { id: 'doc3', slNo: 3, name: 'Copy of VTU application',      optional: false },
  { id: 'doc4', slNo: 4, name: 'Caste Certificate (if claimed)', optional: true },
]

export const PAYMENT_MODES = ['Cash', 'UPI', 'NEFT', 'RTGS', 'DD', 'Other'] as const

export const DECLARATION_TEXT = `I hereby declare that the information furnished above is true, complete and correct to the best of my knowledge and belief. I understand that in the event of any information being found false or incorrect at any stage or any eligibility condition not being fulfilled, my application/admission is liable to be cancelled. I also agree to abide by the rules and regulations of Sahyadri College of Engineering & Management and Visvesvaraya Technological University, Belagavi.

I further declare that I have not submitted any other application for Ph.D. registration/admission at any other University/Institution for the same academic year, and that all the documents uploaded/submitted are genuine and authentic.`

export const STORAGE_KEY = 'phd_admission_draft'
export const AUTH_KEY = 'phd_admission_auth'
