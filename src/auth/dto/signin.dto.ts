import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email do usuário' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongP@ssw0rd', description: 'Senha do usuário' })
  @IsString()
  password!: string;
}
