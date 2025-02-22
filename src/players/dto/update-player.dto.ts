import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';

export class UpdatePlayerDto {
  @ApiProperty({
    example: 'uuid-jogador',
    description: 'ID do jogador',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({
    example: 'João Silva',
    description: 'Nome do jogador',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;
}
