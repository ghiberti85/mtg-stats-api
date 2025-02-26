import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString } from 'class-validator';

export class CreateDeckDto {
  @ApiProperty({
    example: 'uuid-player',
    description: 'ID do jogador dono do deck',
  })
  @IsUUID()
  player_id!: string;

  @ApiProperty({ example: 'Deck One', description: 'Nome do deck' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Aggro', description: 'Arquétipo do deck' })
  @IsString()
  archetype!: string;
}
