import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import {
  ApplicationStatus,
  DocumentType,
  Prisma,
  Programme,
  SignatureType,
  SupervisorType,
  UserRole,
} from '@prisma/client'
import { Express } from 'express'
import { AuthenticatedUser } from '../common/types/authenticated-user.type'
import { PrismaService } from '../prisma/prisma.service'
import { FileStorageService } from './file-storage.service'
import {
  CreateApplicationDto,
  CreateDocumentDto,
  UpdateApplicationDto,
  UpdateApplicationStatusDto,
} from './dto/application.dto'

const applicationInclude = Prisma.validator<Prisma.ApplicationInclude>()({
  applicant: { select: { id: true, email: true } },
  scholar: true,
  supervisors: true,
  qualifications: { orderBy: { sortOrder: 'asc' } },
  documents: { orderBy: { createdAt: 'asc' } },
  feePayments: { orderBy: { sortOrder: 'asc' } },
  declaration: true,
  statusHistory: {
    include: { actor: { select: { id: true, email: true, role: true } } },
    orderBy: { createdAt: 'desc' },
  },
})

type ApplicationRecord = Prisma.ApplicationGetPayload<{ include: typeof applicationInclude }>

const requiredDocuments = [
  { type: DocumentType.UG_CONVOCATION_CERTIFICATE, displayName: 'UG Convocation Certificate', optional: false },
  { type: DocumentType.PG_MARKS_CARD, displayName: 'PG Marks Card', optional: false },
  { type: DocumentType.VTU_APPLICATION_COPY, displayName: 'Copy of VTU application', optional: false },
  { type: DocumentType.CASTE_CERTIFICATE, displayName: 'Caste Certificate (if claimed)', optional: true },
]

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorage: FileStorageService,
  ) {}

  async create(user: AuthenticatedUser, dto: CreateApplicationDto) {
    const application = await this.prisma.application.create({
      data: {
        applicantId: user.id,
        selectedProgramme: dto.selectedProgramme,
        scholar: { create: { email: user.email } },
        supervisors: {
          create: [
            { type: SupervisorType.SUPERVISOR },
            { type: SupervisorType.CO_SUPERVISOR, hasCoSupervisor: false },
          ],
        },
        declaration: { create: {} },
        documents: { create: requiredDocuments },
        statusHistory: { create: { status: ApplicationStatus.DRAFT, actorId: user.id, note: 'Application created' } },
      },
    })
    return this.findOne(user, application.id)
  }

  async findMine(user: AuthenticatedUser) {
    const applications = await this.prisma.application.findMany({
      where: { applicantId: user.id },
      include: applicationInclude,
      orderBy: { updatedAt: 'desc' },
    })
    return applications.map((application) => this.serialize(application))
  }

  async findForStaff(status?: ApplicationStatus, programme?: Programme) {
    const applications = await this.prisma.application.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(programme ? { selectedProgramme: programme } : {}),
      },
      include: applicationInclude,
      orderBy: { submittedAt: 'desc' },
    })
    return applications.map((application) => this.serialize(application))
  }

  async findOne(user: AuthenticatedUser, applicationId: string) {
    const application = await this.getApplication(applicationId)
    this.assertCanAccess(application, user)
    return this.serialize(application)
  }

  async updateDraft(user: AuthenticatedUser, applicationId: string, dto: UpdateApplicationDto) {
    const current = await this.getApplication(applicationId)
    this.assertOwnerCanEdit(current, user)

    await this.prisma.$transaction(async (tx) => {
      await tx.application.update({
        where: { id: applicationId },
        data: {
          ...(dto.selectedProgramme ? { selectedProgramme: dto.selectedProgramme } : {}),
          ...(dto.currentStep !== undefined ? { currentStep: dto.currentStep } : {}),
          updatedAt: new Date(),
        },
      })

      if (dto.scholar) {
        await tx.scholarDetails.update({
          where: { applicationId },
          data: {
            name: dto.scholar.name,
            email: dto.scholar.email,
            contactNumber: dto.scholar.contactNumber,
            whatsapp: dto.scholar.whatsapp,
            proposedResearchTopic: dto.scholar.proposedResearchTopic,
            profession: dto.scholar.profession,
            guardianName: dto.scholar.fatherGuardianSpouseName,
            alternateNumber: dto.scholar.alternateNumber,
            studyMode: dto.scholar.studyMode,
            addressForCommunication: dto.scholar.addressForCommunication,
          },
        })
      }

      if (dto.supervisor) {
        await tx.supervisorDetails.update({
          where: { applicationId_type: { applicationId, type: SupervisorType.SUPERVISOR } },
          data: this.supervisorData(dto.supervisor),
        })
      }

      if (dto.coSupervisor) {
        const { hasCoSupervisor, ...details } = dto.coSupervisor
        await tx.supervisorDetails.update({
          where: { applicationId_type: { applicationId, type: SupervisorType.CO_SUPERVISOR } },
          data: { ...this.supervisorData(details), hasCoSupervisor },
        })
      }

      if (dto.qualifications) {
        await tx.qualification.deleteMany({ where: { applicationId } })
        if (dto.qualifications.length) {
          await tx.qualification.createMany({
            data: dto.qualifications.map((qualification, index) => ({
              applicationId,
              degree: qualification.degree,
              university: qualification.university,
              percentage: qualification.percentage,
              sortOrder: index,
            })),
          })
        }
      }

      if (dto.feePayments) {
        await tx.feePayment.deleteMany({ where: { applicationId } })
        if (dto.feePayments.length) {
          await tx.feePayment.createMany({
            data: dto.feePayments.map((payment, index) => ({
              applicationId,
              academicYear: payment.academicYear,
              paymentDate: this.toOptionalDate(payment.date),
              amount: payment.amount,
              modeOfPayment: payment.modeOfPayment,
              details: payment.details,
              sortOrder: index,
            })),
          })
        }
      }

      if (dto.declaration) {
        await tx.declaration.update({
          where: { applicationId },
          data: {
            agreed: dto.declaration.agreed,
            declarationDate: this.toOptionalDate(dto.declaration.date),
            agreedAt: dto.declaration.agreed ? new Date() : null,
          },
        })
      }
    })

    return this.findOne(user, applicationId)
  }

  async uploadPhoto(user: AuthenticatedUser, applicationId: string, file: Express.Multer.File) {
    const application = await this.getApplication(applicationId)
    this.assertOwnerCanEdit(application, user)
    const upload = await this.fileStorage.save(applicationId, 'photo', file)
    try {
      const updated = await this.prisma.application.update({
        where: { id: applicationId },
        data: { photographPath: upload.storagePath },
      })
      await this.fileStorage.delete(application.photographPath)
      return { photographUrl: this.photoUrl(updated.id), originalName: upload.originalName }
    } catch (error: unknown) {
      await this.fileStorage.delete(upload.storagePath)
      throw error
    }
  }

  async removePhoto(user: AuthenticatedUser, applicationId: string) {
    const application = await this.getApplication(applicationId)
    this.assertOwnerCanEdit(application, user)
    await this.prisma.application.update({ where: { id: applicationId }, data: { photographPath: null } })
    await this.fileStorage.delete(application.photographPath)
  }

  async uploadSignature(
    user: AuthenticatedUser,
    applicationId: string,
    signatureType: SignatureType,
    file: Express.Multer.File,
  ) {
    const application = await this.getApplication(applicationId)
    this.assertOwnerCanEdit(application, user)
    const upload = await this.fileStorage.save(applicationId, 'signature', file)
    const previousPath = application.declaration?.signaturePath
    try {
      await this.prisma.declaration.update({
        where: { applicationId },
        data: { signatureType, signaturePath: upload.storagePath },
      })
      await this.fileStorage.delete(previousPath)
      return { signatureUrl: this.signatureUrl(applicationId), type: signatureType.toLowerCase() }
    } catch (error: unknown) {
      await this.fileStorage.delete(upload.storagePath)
      throw error
    }
  }

  async removeSignature(user: AuthenticatedUser, applicationId: string) {
    const application = await this.getApplication(applicationId)
    this.assertOwnerCanEdit(application, user)
    const previousPath = application.declaration?.signaturePath
    await this.prisma.declaration.update({
      where: { applicationId },
      data: { signatureType: null, signaturePath: null },
    })
    await this.fileStorage.delete(previousPath)
  }

  async createDocument(user: AuthenticatedUser, applicationId: string, dto: CreateDocumentDto) {
    const application = await this.getApplication(applicationId)
    this.assertOwnerCanEdit(application, user)
    const existing = application.documents.find((document) => document.type === dto.type)
    if (existing) throw new ConflictException('A document of this type already exists for this application.')

    const document = await this.prisma.applicationDocument.create({
      data: {
        applicationId,
        type: dto.type,
        displayName: dto.displayName,
        optional: dto.optional ?? dto.type === DocumentType.OTHER,
      },
    })
    return this.serializeDocument(document, applicationId, application.documents.length + 1)
  }

  async uploadDocument(user: AuthenticatedUser, applicationId: string, documentId: string, file: Express.Multer.File) {
    const application = await this.getApplication(applicationId)
    this.assertOwnerCanEdit(application, user)
    const document = application.documents.find((item) => item.id === documentId)
    if (!document) throw new NotFoundException('Document not found for this application.')

    const upload = await this.fileStorage.save(applicationId, 'document', file)
    try {
      const updated = await this.prisma.applicationDocument.update({
        where: { id: documentId },
        data: {
          storagePath: upload.storagePath,
          originalName: upload.originalName,
          mimeType: upload.mimeType,
          sizeBytes: upload.sizeBytes,
          uploadedAt: new Date(),
        },
      })
      await this.fileStorage.delete(document.storagePath)
      return this.serializeDocument(updated, applicationId, application.documents.findIndex((item) => item.id === documentId) + 1)
    } catch (error: unknown) {
      await this.fileStorage.delete(upload.storagePath)
      throw error
    }
  }

  async removeDocumentFile(user: AuthenticatedUser, applicationId: string, documentId: string) {
    const application = await this.getApplication(applicationId)
    this.assertOwnerCanEdit(application, user)
    const document = application.documents.find((item) => item.id === documentId)
    if (!document) throw new NotFoundException('Document not found for this application.')

    await this.prisma.applicationDocument.update({
      where: { id: documentId },
      data: { storagePath: null, originalName: null, mimeType: null, sizeBytes: null, uploadedAt: null },
    })
    await this.fileStorage.delete(document.storagePath)
  }

  async submit(user: AuthenticatedUser, applicationId: string) {
    const application = await this.getApplication(applicationId)
    this.assertOwnerCanEdit(application, user)
    this.validateForSubmission(application)

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const applicationNumber = await this.createApplicationNumber(application.selectedProgramme)
      try {
        await this.prisma.$transaction(async (tx) => {
          const result = await tx.application.updateMany({
            where: { id: applicationId, status: ApplicationStatus.DRAFT },
            data: {
              status: ApplicationStatus.SUBMITTED,
              applicationNumber,
              submittedAt: new Date(),
              currentStep: 8,
            },
          })
          if (result.count !== 1) throw new ConflictException('This application has already been submitted.')
          await tx.applicationStatusLog.create({
            data: { applicationId, status: ApplicationStatus.SUBMITTED, actorId: user.id, note: 'Application submitted by applicant' },
          })
        })
        return this.findOne(user, applicationId)
      } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') continue
        throw error
      }
    }
    throw new ConflictException('Could not allocate an application number. Please try again.')
  }

  async updateStatus(user: AuthenticatedUser, applicationId: string, dto: UpdateApplicationStatusDto) {
    const application = await this.getApplication(applicationId)
    if (application.status === ApplicationStatus.DRAFT) {
      throw new BadRequestException('A draft cannot enter the review workflow.')
    }
    if (dto.status === ApplicationStatus.DRAFT || dto.status === ApplicationStatus.SUBMITTED) {
      throw new BadRequestException('Staff must choose a review decision status.')
    }

    await this.prisma.$transaction([
      this.prisma.application.update({ where: { id: applicationId }, data: { status: dto.status } }),
      this.prisma.applicationStatusLog.create({
        data: { applicationId, status: dto.status, actorId: user.id, note: dto.note?.trim() || null },
      }),
    ])
    return this.findOne(user, applicationId)
  }

  async getPhoto(user: AuthenticatedUser, applicationId: string) {
    const application = await this.getApplication(applicationId)
    this.assertCanAccess(application, user)
    if (!application.photographPath) throw new NotFoundException('No photograph has been uploaded.')
    return { stream: this.fileStorage.open(application.photographPath), type: this.fileStorage.mimeTypeForPath(application.photographPath) }
  }

  async getSignature(user: AuthenticatedUser, applicationId: string) {
    const application = await this.getApplication(applicationId)
    this.assertCanAccess(application, user)
    if (!application.declaration?.signaturePath) throw new NotFoundException('No signature has been uploaded.')
    return {
      stream: this.fileStorage.open(application.declaration.signaturePath),
      type: this.fileStorage.mimeTypeForPath(application.declaration.signaturePath),
    }
  }

  async getDocumentFile(user: AuthenticatedUser, applicationId: string, documentId: string) {
    const application = await this.getApplication(applicationId)
    this.assertCanAccess(application, user)
    const document = application.documents.find((item) => item.id === documentId)
    if (!document?.storagePath) throw new NotFoundException('No file has been uploaded for this document.')
    return { stream: this.fileStorage.open(document.storagePath), document }
  }

  private async getApplication(applicationId: string): Promise<ApplicationRecord> {
    const application = await this.prisma.application.findUnique({ where: { id: applicationId }, include: applicationInclude })
    if (!application) throw new NotFoundException('Application not found.')
    return application
  }

  private assertCanAccess(application: ApplicationRecord, user: AuthenticatedUser) {
    if (user.role === UserRole.APPLICANT && application.applicantId !== user.id) {
      throw new ForbiddenException('You do not have access to this application.')
    }
  }

  private assertOwnerCanEdit(application: ApplicationRecord, user: AuthenticatedUser) {
    if (application.applicantId !== user.id || user.role !== UserRole.APPLICANT) {
      throw new ForbiddenException('Only the applicant can edit this draft.')
    }
    if (application.status !== ApplicationStatus.DRAFT) {
      throw new ConflictException('A submitted application cannot be edited.')
    }
  }

  private supervisorData(details: {
    name: string
    email: string
    contactNumber: string
    whatsapp: string
    profession: string
    addressOfInstitution: string
    addressForCommunication: string
  }) {
    return {
      name: details.name,
      email: details.email,
      contactNumber: details.contactNumber,
      whatsapp: details.whatsapp,
      profession: details.profession,
      addressOfInstitution: details.addressOfInstitution,
      addressForCommunication: details.addressForCommunication,
    }
  }

  private validateForSubmission(application: ApplicationRecord) {
    const scholar = application.scholar
    const supervisor = application.supervisors.find((item) => item.type === SupervisorType.SUPERVISOR)
    const fieldMissing = (value?: string | null) => !value?.trim()
    const validEmail = (value?: string | null) => Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))

    const scholarFields = [
      scholar?.name,
      scholar?.contactNumber,
      scholar?.proposedResearchTopic,
      scholar?.profession,
      scholar?.guardianName,
      scholar?.studyMode,
      scholar?.addressForCommunication,
    ]
    if (scholarFields.some(fieldMissing) || !validEmail(scholar?.email)) {
      throw new BadRequestException('Complete valid scholar details before submitting.')
    }

    const supervisorFields = [
      supervisor?.name,
      supervisor?.contactNumber,
      supervisor?.profession,
      supervisor?.addressOfInstitution,
    ]
    if (supervisorFields.some(fieldMissing) || !validEmail(supervisor?.email)) {
      throw new BadRequestException('Complete valid supervisor details before submitting.')
    }

    if (!application.qualifications.length || application.qualifications.some((item) =>
      fieldMissing(item.degree) || fieldMissing(item.university) || fieldMissing(item.percentage),
    )) {
      throw new BadRequestException('Add complete qualification details before submitting.')
    }

    if (application.documents.some((document) => !document.optional && !document.storagePath)) {
      throw new BadRequestException('Upload all mandatory documents before submitting.')
    }

    if (!application.declaration?.agreed || !application.declaration.signaturePath) {
      throw new BadRequestException('Accept the declaration and upload a signature before submitting.')
    }
  }

  private async createApplicationNumber(programme: Programme) {
    const code = programme === Programme.Maths ? 'MATHS' : programme
    const year = new Date().getFullYear()
    const random = Math.floor(100000 + Math.random() * 900000)
    return `PHD${code}${year}${random}`
  }

  private toOptionalDate(value?: string) {
    return value?.trim() ? new Date(value) : null
  }

  private serialize(application: ApplicationRecord) {
    const supervisor = application.supervisors.find((item) => item.type === SupervisorType.SUPERVISOR)
    const coSupervisor = application.supervisors.find((item) => item.type === SupervisorType.CO_SUPERVISOR)
    const declaration = application.declaration

    return {
      id: application.id,
      applicationNumber: application.applicationNumber,
      selectedProgramme: application.selectedProgramme,
      status: application.status.toLowerCase(),
      workflowStatus: application.status,
      currentStep: application.currentStep,
      applicant: application.applicant,
      photographUrl: application.photographPath ? this.photoUrl(application.id) : null,
      scholar: application.scholar ? {
        name: application.scholar.name,
        email: application.scholar.email,
        contactNumber: application.scholar.contactNumber,
        whatsapp: application.scholar.whatsapp,
        proposedResearchTopic: application.scholar.proposedResearchTopic,
        profession: application.scholar.profession,
        fatherGuardianSpouseName: application.scholar.guardianName,
        alternateNumber: application.scholar.alternateNumber,
        studyMode: application.scholar.studyMode,
        addressForCommunication: application.scholar.addressForCommunication,
      } : null,
      supervisor: this.serializeSupervisor(supervisor),
      coSupervisor: { hasCoSupervisor: coSupervisor?.hasCoSupervisor ?? false, ...this.serializeSupervisor(coSupervisor) },
      qualifications: application.qualifications.map((qualification) => ({
        id: qualification.id,
        degree: qualification.degree,
        university: qualification.university,
        percentage: qualification.percentage,
      })),
      documents: application.documents.map((document, index) => this.serializeDocument(document, application.id, index + 1)),
      feePayments: application.feePayments.map((payment) => ({
        id: payment.id,
        academicYear: payment.academicYear,
        date: payment.paymentDate?.toISOString().slice(0, 10) ?? '',
        amount: payment.amount,
        modeOfPayment: payment.modeOfPayment,
        details: payment.details,
      })),
      declaration: {
        agreed: declaration?.agreed ?? false,
        date: declaration?.declarationDate?.toISOString().slice(0, 10) ?? '',
      },
      signature: declaration?.signaturePath ? {
        type: declaration.signatureType?.toLowerCase() ?? 'none',
        url: this.signatureUrl(application.id),
      } : { type: 'none' },
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
      submittedAt: application.submittedAt?.toISOString() ?? null,
      statusHistory: application.statusHistory.map((entry) => ({
        id: entry.id,
        status: entry.status,
        note: entry.note,
        createdAt: entry.createdAt.toISOString(),
        actor: entry.actor,
      })),
    }
  }

  private serializeSupervisor(supervisor?: ApplicationRecord['supervisors'][number]) {
    return {
      name: supervisor?.name ?? '',
      email: supervisor?.email ?? '',
      contactNumber: supervisor?.contactNumber ?? '',
      whatsapp: supervisor?.whatsapp ?? '',
      profession: supervisor?.profession ?? '',
      addressOfInstitution: supervisor?.addressOfInstitution ?? '',
      addressForCommunication: supervisor?.addressForCommunication ?? '',
    }
  }

  private serializeDocument(
    document: ApplicationRecord['documents'][number],
    applicationId: string,
    serialNumber: number,
  ) {
    return {
      id: document.id,
      slNo: serialNumber,
      type: document.type,
      name: document.displayName,
      optional: document.optional,
      fileName: document.originalName ?? undefined,
      mimeType: document.mimeType ?? undefined,
      sizeBytes: document.sizeBytes ?? undefined,
      status: document.storagePath ? 'uploaded' : 'pending',
      uploadedAt: document.uploadedAt?.toISOString() ?? null,
      downloadUrl: document.storagePath ? this.documentUrl(applicationId, document.id) : null,
    }
  }

  private photoUrl(applicationId: string) {
    return `/api/applications/${applicationId}/photo`
  }

  private signatureUrl(applicationId: string) {
    return `/api/applications/${applicationId}/signature`
  }

  private documentUrl(applicationId: string, documentId: string) {
    return `/api/applications/${applicationId}/documents/${documentId}/download`
  }
}
