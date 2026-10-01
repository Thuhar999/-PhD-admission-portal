import { BadRequestException, Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common'
import { Express } from 'express'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import { createReadStream, existsSync } from 'node:fs'
import { basename, extname, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

export type UploadPurpose = 'photo' | 'signature' | 'document'

@Injectable()
export class FileStorageService implements OnModuleInit {
  private readonly root = resolve(process.env.UPLOAD_DIR ?? './uploads')

  async onModuleInit() {
    await mkdir(this.root, { recursive: true })
  }

  async save(applicationId: string, purpose: UploadPurpose, file: Express.Multer.File) {
    this.validate(file, purpose)
    const extension = extname(file.originalname).toLowerCase() || this.extensionForMime(file.mimetype)
    const relativePath = `${applicationId}/${purpose}/${randomUUID()}${extension}`
    const absolutePath = this.absolutePath(relativePath)

    try {
      await mkdir(resolve(absolutePath, '..'), { recursive: true })
      await writeFile(absolutePath, file.buffer)
    } catch {
      throw new InternalServerErrorException('Could not store the uploaded file.')
    }

    return {
      storagePath: relativePath,
      originalName: basename(file.originalname),
      mimeType: file.mimetype,
      sizeBytes: file.size,
    }
  }

  delete(storagePath?: string | null) {
    if (!storagePath) return Promise.resolve()
    const absolutePath = this.absolutePath(storagePath)
    return unlink(absolutePath).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error
    })
  }

  open(storagePath: string) {
    const absolutePath = this.absolutePath(storagePath)
    if (!existsSync(absolutePath)) throw new BadRequestException('The stored file is no longer available.')
    return createReadStream(absolutePath)
  }

  mimeTypeForPath(storagePath: string) {
    switch (extname(storagePath).toLowerCase()) {
      case '.png': return 'image/png'
      case '.jpg':
      case '.jpeg': return 'image/jpeg'
      case '.pdf': return 'application/pdf'
      default: return 'application/octet-stream'
    }
  }

  private absolutePath(storagePath: string) {
    const absolutePath = resolve(this.root, storagePath)
    if (!absolutePath.startsWith(`${this.root}/`) && absolutePath !== this.root) {
      throw new BadRequestException('Invalid file path.')
    }
    return absolutePath
  }

  private validate(file: Express.Multer.File | undefined, purpose: UploadPurpose) {
    if (!file) throw new BadRequestException('A file is required.')
    if (file.size > 5 * 1024 * 1024) throw new BadRequestException('Files must be 5 MB or smaller.')

    const images = ['image/jpeg', 'image/png']
    const allowed = purpose === 'document' ? [...images, 'application/pdf'] : images
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(
        purpose === 'document' ? 'Only PDF, JPG, and PNG documents are accepted.' : 'Only JPG and PNG images are accepted.',
      )
    }
  }

  private extensionForMime(mimeType: string) {
    return mimeType === 'application/pdf' ? '.pdf' : mimeType === 'image/png' ? '.png' : '.jpg'
  }
}
