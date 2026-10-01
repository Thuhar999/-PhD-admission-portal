import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User, UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { AuthenticatedUser } from '../common/types/authenticated-user.type'
import { PrismaService } from '../prisma/prisma.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase()
    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) throw new ConflictException('An account with this email already exists.')

    const user = await this.prisma.user.create({
      data: { email, passwordHash: await bcrypt.hash(dto.password, 12) },
    })
    return this.loginUser(user)
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase()
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password.')
    }
    return this.loginUser(user)
  }

  getProfile(user: AuthenticatedUser) {
    return { id: user.id, email: user.email, role: user.role }
  }

  private async loginUser(user: User) {
    const payload: AuthenticatedUser = { id: user.id, email: user.email, role: user.role as UserRole }
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: payload,
    }
  }
}
