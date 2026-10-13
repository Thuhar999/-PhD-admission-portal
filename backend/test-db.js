const { PrismaClient } = require('@prisma/client')
if (typeof process.loadEnvFile === 'function') {
  process.loadEnvFile()
}
console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 30))
const prisma = new PrismaClient()
async function run() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } })
  console.log('Success! Users in database count:', users.length, users.map(u => ({ email: u.email, role: u.role })))
}
run().catch(console.error).finally(() => prisma.$disconnect())
