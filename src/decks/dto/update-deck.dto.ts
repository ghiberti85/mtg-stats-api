// src/decks/dto/update-deck.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';

export class UpdateDeckDto {
  @ApiProperty({
    example: 'uuid-deck',
    description: 'ID do deck',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({
    example: 'Golgari Midrange',
    description: 'Nome do deck',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'modern',
    description: 'Formato do deck',
    required: false,
  })
  @IsString()
  @IsOptional()
  format?: string;
}
