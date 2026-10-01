import { Transform, Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ApplicationStatus, DocumentType, Programme, SignatureType } from '@prisma/client'
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator'

export class CreateApplicationDto {
  @ApiProperty({ enum: Programme, example: Programme.CSE })
  @IsEnum(Programme)
  selectedProgramme!: Programme
}

export class ScholarDetailsDto {
  @IsString() @MaxLength(160) name!: string
  @IsString() @MaxLength(254) email!: string
  @IsString() @MaxLength(30) contactNumber!: string
  @IsString() @MaxLength(30) whatsapp!: string
  @IsString() @MaxLength(1000) proposedResearchTopic!: string
  @IsString() @MaxLength(160) profession!: string
  @IsString() @MaxLength(160) fatherGuardianSpouseName!: string
  @IsString() @MaxLength(30) alternateNumber!: string
  @IsString() @MaxLength(20) studyMode!: string
  @IsString() @MaxLength(2000) addressForCommunication!: string
}

export class SupervisorDetailsDto {
  @IsString() @MaxLength(160) name!: string
  @IsString() @MaxLength(254) email!: string
  @IsString() @MaxLength(30) contactNumber!: string
  @IsString() @MaxLength(30) whatsapp!: string
  @IsString() @MaxLength(160) profession!: string
  @IsString() @MaxLength(2000) addressOfInstitution!: string
  @IsString() @MaxLength(2000) addressForCommunication!: string
}

export class CoSupervisorDetailsDto extends SupervisorDetailsDto {
  @IsBoolean()
  hasCoSupervisor!: boolean
}

export class QualificationDto {
  @IsString() @MaxLength(160) degree!: string
  @IsString() @MaxLength(255) university!: string
  @IsString() @MaxLength(40) percentage!: string
}

export class FeePaymentDto {
  @IsString() @MaxLength(30) academicYear!: string

  // Empty dates are permitted for drafts. A valid date is enforced only for a supplied value.
  @Transform(({ value }) => typeof value === 'string' && !value.trim() ? undefined : value)
  @IsOptional() @IsDateString() date?: string

  @IsString() @MaxLength(40) amount!: string
  @IsString() @MaxLength(50) modeOfPayment!: string
  @IsString() @MaxLength(500) details!: string
}

export class DeclarationDto {
  @IsBoolean()
  agreed!: boolean

  @Transform(({ value }) => typeof value === 'string' && !value.trim() ? undefined : value)
  @IsOptional() @IsDateString()
  date?: string
}

export class UpdateApplicationDto {
  @ApiPropertyOptional({ enum: Programme })
  @IsOptional() @IsEnum(Programme)
  selectedProgramme?: Programme

  @ApiPropertyOptional({ minimum: 1, maximum: 8 })
  @IsOptional() @IsInt() @Min(1) @Max(8)
  currentStep?: number

  @IsOptional() @ValidateNested() @Type(() => ScholarDetailsDto)
  scholar?: ScholarDetailsDto

  @IsOptional() @ValidateNested() @Type(() => SupervisorDetailsDto)
  supervisor?: SupervisorDetailsDto

  @IsOptional() @ValidateNested() @Type(() => CoSupervisorDetailsDto)
  coSupervisor?: CoSupervisorDetailsDto

  @IsOptional() @IsArray() @ArrayMaxSize(20)
  @ValidateNested({ each: true }) @Type(() => QualificationDto)
  qualifications?: QualificationDto[]

  @IsOptional() @IsArray() @ArrayMaxSize(20)
  @ValidateNested({ each: true }) @Type(() => FeePaymentDto)
  feePayments?: FeePaymentDto[]

  @IsOptional() @ValidateNested() @Type(() => DeclarationDto)
  declaration?: DeclarationDto
}

export class CreateDocumentDto {
  @ApiProperty({ enum: DocumentType, example: DocumentType.OTHER })
  @IsEnum(DocumentType)
  type!: DocumentType

  @IsString() @MaxLength(255)
  displayName!: string

  @IsOptional() @IsBoolean()
  optional?: boolean
}

export class UploadSignatureDto {
  @ApiProperty({ enum: SignatureType })
  @IsEnum(SignatureType)
  type!: SignatureType
}

export class UpdateApplicationStatusDto {
  @ApiProperty({ enum: ApplicationStatus })
  @IsEnum(ApplicationStatus)
  status!: ApplicationStatus

  @IsOptional() @IsString() @MaxLength(2000)
  note?: string
}
