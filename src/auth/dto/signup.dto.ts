// src/auth/dto/signup.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    example: 'player@example.com',
    description: 'Email do usuário',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd',
    description: 'Senha do usuário (mínimo 6 caracteres)',
  })
  @MinLength(6)
  password!: string;
}
