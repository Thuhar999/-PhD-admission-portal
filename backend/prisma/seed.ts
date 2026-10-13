import { PrismaClient, UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'

if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile()
  } catch {
    // ignore if .env is missing or already loaded
  }
}

const prisma = new PrismaClient()

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.SEED_ADMIN_PASSWORD

  if (!email || !password) {
    console.info('No staff account seeded: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD first.')
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: UserRole.ADMIN },
    create: { email, passwordHash, role: UserRole.ADMIN },
  })
  console.info(`Admin account is ready for ${email}.`)

  // Also seed the demo applicant account used by the login page
  const demoEmail = 'scholar.phd@sahyadri.edu.in'
  const demoPassword = 'Sahyadri@2026'
  const demoHash = await bcrypt.hash(demoPassword, 12)
  await prisma.user.upsert({
    where: { email: demoEmail },
    update: { passwordHash: demoHash, role: UserRole.APPLICANT },
    create: { email: demoEmail, passwordHash: demoHash, role: UserRole.APPLICANT },
  })
  console.info(`Demo applicant account is ready for ${demoEmail}.`)
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
