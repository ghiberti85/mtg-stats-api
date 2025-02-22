import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateDeckDto {
  @ApiProperty({
    example: '11111fd7-dcf7-4b58-9eeb-a26961c97d3c',
    description: 'ID do Deck',
  })
  @IsUUID()
  id: string;

  @ApiProperty({ example: 'Test Deck', description: 'Nome do Deck' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'modern', description: 'Arquétipo do deck' })
  @IsString()
  archetype: string;

  @ApiProperty({
    example: '2025-02-19T20:17:27.158Z',
    description: 'Data de criação',
  })
  @IsOptional()
  created_at?: string;

  @ApiProperty({
    example: '2025-02-19T20:17:27.158Z',
    description: 'Última atualização',
  })
  @IsOptional()
  updated_at?: string;
}
