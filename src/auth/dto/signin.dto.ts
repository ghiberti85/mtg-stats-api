import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    example: 'player@example.com',
    description: 'Email do usuário',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongP@ssw0rd', description: 'Senha do usuário' })
  password: string;
}
