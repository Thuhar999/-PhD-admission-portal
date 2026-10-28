import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Express } from 'express'
import { extname, basename } from 'node:path'
import { randomUUID } from 'node:crypto'

export type UploadPurpose = 'photo' | 'signature' | 'document'

const DEFAULT_BUCKET = 'phd-portal'

@Injectable()
export class FileStorageService {
  private readonly supabase: SupabaseClient
  private readonly logger = new Logger(FileStorageService.name)
  private readonly bucket: string

  constructor(private readonly config: ConfigService) {
    const url = this.config.getOrThrow<string>('SUPABASE_URL')
    const key = this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY')
    this.bucket = this.config.get<string>('SUPABASE_BUCKET') || DEFAULT_BUCKET
    this.supabase = createClient(url, key, {
      auth: { persistSession: false },
    })
  }

  async save(applicationId: string, purpose: UploadPurpose, file: Express.Multer.File) {
    this.validate(file, purpose)

    const extension = extname(file.originalname).toLowerCase() || this.extensionForMime(file.mimetype)
    const storagePath = `${applicationId}/${purpose}/${randomUUID()}${extension}`

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      })

    if (error) {
      this.logger.error(`Supabase upload failed: ${error.message}`)
      throw new InternalServerErrorException('Could not store the uploaded file.')
    }

    return {
      storagePath,
      originalName: basename(file.originalname),
      mimeType: file.mimetype,
      sizeBytes: file.size,
    }
  }

  async delete(storagePath?: string | null): Promise<void> {
    if (!storagePath) return
    const { error } = await this.supabase.storage.from(this.bucket).remove([storagePath])
    if (error) {
      this.logger.warn(`Supabase delete failed for ${storagePath}: ${error.message}`)
    }
  }

  async open(storagePath: string): Promise<Buffer> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .download(storagePath)

    if (error || !data) {
      this.logger.error(`Supabase download failed for ${storagePath}: ${error?.message}`)
      throw new BadRequestException('The stored file is no longer available.')
    }

    const arrayBuffer = await data.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  mimeTypeForPath(storagePath: string): string {
    switch (extname(storagePath).toLowerCase()) {
      case '.png': return 'image/png'
      case '.jpg':
      case '.jpeg': return 'image/jpeg'
      case '.pdf': return 'application/pdf'
      default: return 'application/octet-stream'
    }
  }

  private validate(file: Express.Multer.File | undefined, purpose: UploadPurpose) {
    if (!file) throw new BadRequestException('A file is required.')
    if (file.size > 5 * 1024 * 1024) throw new BadRequestException('Files must be 5 MB or smaller.')

    const images = ['image/jpeg', 'image/png']
    const allowed = purpose === 'document' ? [...images, 'application/pdf'] : images
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(
        purpose === 'document'
          ? 'Only PDF, JPG, and PNG documents are accepted.'
          : 'Only JPG and PNG images are accepted.',
      )
    }
  }

  private extensionForMime(mimeType: string): string {
    return mimeType === 'application/pdf' ? '.pdf' : mimeType === 'image/png' ? '.png' : '.jpg'
  }
}
