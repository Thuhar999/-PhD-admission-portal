import { INestApplication, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  async onModuleInit() {
    const maxRetries = 4
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.$connect()
        this.logger.log('Database connected successfully.')
        return
      } catch (err: unknown) {
        this.logger.warn(`Database connection attempt ${attempt}/${maxRetries} failed: ${(err as Error)?.message}`)
        if (attempt === maxRetries) {
          this.logger.error('Could not reach database on startup. Will attempt connection on next query.')
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1500 * attempt))
        }
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }

  enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit' as never, async () => {
      await app.close()
    })
  }
}
