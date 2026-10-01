import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MaxLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({ example: 'scholar@example.edu.in' })
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'A-strong-password1' })
  @IsString()
  @MaxLength(128)
  password!: string
}
