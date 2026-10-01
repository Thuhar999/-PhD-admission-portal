import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(helmet({ crossOriginResourcePolicy: false }))
  app.enableCors({
    origin: (process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173').split(',').map((origin) => origin.trim()),
    credentials: true,
  })
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Ph.D. Admission Portal API')
    .setDescription('Authenticated API for Ph.D. applications, files, and staff review.')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig))

  await app.listen(Number(process.env.PORT ?? 3000))
}

void bootstrap()
