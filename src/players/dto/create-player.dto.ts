// src/players/dto/create-player.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsInt, Min } from 'class-validator';

export class CreatePlayerDto {
  @ApiProperty({ example: 'João Silva', description: 'Nome do jogador' })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'player@example.com',
    description: 'Email do jogador',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 10,
    description: 'Nível do jogador',
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  level?: number;
}
