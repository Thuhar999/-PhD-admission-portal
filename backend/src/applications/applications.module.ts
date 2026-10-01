import { Module } from '@nestjs/common'
import { ApplicationsController } from './applications.controller'
import { ApplicationsService } from './applications.service'
import { FileStorageService } from './file-storage.service'

@Module({
  controllers: [ApplicationsController],
  providers: [ApplicationsService, FileStorageService],
})
export class ApplicationsModule {}
