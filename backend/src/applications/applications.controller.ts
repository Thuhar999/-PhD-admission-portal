import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Patch,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { ApplicationStatus, Programme, SignatureType, UserRole } from '@prisma/client'
import { Express } from 'express'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { AuthenticatedUser } from '../common/types/authenticated-user.type'
import { ApplicationsService } from './applications.service'
import {
  CreateApplicationDto,
  CreateDocumentDto,
  UpdateApplicationDto,
  UpdateApplicationStatusDto,
  UploadSignatureDto,
} from './dto/application.dto'

const uploadOptions = { limits: { fileSize: 5 * 1024 * 1024 } }

@ApiTags('applications')
@ApiBearerAuth()
@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(user, dto)
  }

  @Get('mine')
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.applicationsService.findMine(user)
  }

  @Get('review')
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  findForStaff(
    @Query('status', new ParseEnumPipe(ApplicationStatus, { optional: true })) status?: ApplicationStatus,
    @Query('programme', new ParseEnumPipe(Programme, { optional: true })) programme?: Programme,
  ) {
    return this.applicationsService.findForStaff(status, programme)
  }

  @Get(':applicationId')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('applicationId') applicationId: string) {
    return this.applicationsService.findOne(user, applicationId)
  }

  @Patch(':applicationId')
  updateDraft(
    @CurrentUser() user: AuthenticatedUser,
    @Param('applicationId') applicationId: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applicationsService.updateDraft(user, applicationId, dto)
  }

  @Post(':applicationId/photo')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  uploadPhoto(
    @CurrentUser() user: AuthenticatedUser,
    @Param('applicationId') applicationId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.applicationsService.uploadPhoto(user, applicationId, file)
  }

  @Delete(':applicationId/photo')
  removePhoto(@CurrentUser() user: AuthenticatedUser, @Param('applicationId') applicationId: string) {
    return this.applicationsService.removePhoto(user, applicationId)
  }

  @Get(':applicationId/photo')
  async getPhoto(@CurrentUser() user: AuthenticatedUser, @Param('applicationId') applicationId: string) {
    const { stream, type } = await this.applicationsService.getPhoto(user, applicationId)
    return new StreamableFile(stream, { type })
  }

  @Post(':applicationId/signature')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  uploadSignature(
    @CurrentUser() user: AuthenticatedUser,
    @Param('applicationId') applicationId: string,
    @Body() dto: UploadSignatureDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.applicationsService.uploadSignature(user, applicationId, dto.type, file)
  }

  @Delete(':applicationId/signature')
  removeSignature(@CurrentUser() user: AuthenticatedUser, @Param('applicationId') applicationId: string) {
    return this.applicationsService.removeSignature(user, applicationId)
  }

  @Get(':applicationId/signature')
  async getSignature(@CurrentUser() user: AuthenticatedUser, @Param('applicationId') applicationId: string) {
    const { stream, type } = await this.applicationsService.getSignature(user, applicationId)
    return new StreamableFile(stream, { type })
  }

  @Post(':applicationId/documents')
  createDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Param('applicationId') applicationId: string,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.applicationsService.createDocument(user, applicationId, dto)
  }

  @Post(':applicationId/documents/:documentId/file')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  uploadDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Param('applicationId') applicationId: string,
    @Param('documentId') documentId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.applicationsService.uploadDocument(user, applicationId, documentId, file)
  }

  @Delete(':applicationId/documents/:documentId/file')
  removeDocumentFile(
    @CurrentUser() user: AuthenticatedUser,
    @Param('applicationId') applicationId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.applicationsService.removeDocumentFile(user, applicationId, documentId)
  }

  @Get(':applicationId/documents/:documentId/download')
  async downloadDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Param('applicationId') applicationId: string,
    @Param('documentId') documentId: string,
  ) {
    const { stream, document } = await this.applicationsService.getDocumentFile(user, applicationId, documentId)
    return new StreamableFile(stream, {
      type: document.mimeType ?? 'application/octet-stream',
      disposition: `attachment; filename="${encodeURIComponent(document.originalName ?? document.displayName)}"`,
    })
  }

  @Post(':applicationId/submit')
  submit(@CurrentUser() user: AuthenticatedUser, @Param('applicationId') applicationId: string) {
    return this.applicationsService.submit(user, applicationId)
  }

  @Patch(':applicationId/status')
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('applicationId') applicationId: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(user, applicationId, dto)
  }
}
