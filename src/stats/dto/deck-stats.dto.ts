import { ApiProperty } from '@nestjs/swagger';

export class DeckStatsDto {
  @ApiProperty({ example: 'deck-uuid', description: 'ID do deck' })
  deckId!: string;

  @ApiProperty({ example: 10, description: 'Total de partidas' })
  total!: number;

  @ApiProperty({ example: 6, description: 'Total de vitórias' })
  wins!: number;

  @ApiProperty({ example: 60, description: 'Taxa de vitória (%)' })
  winRate!: number;
}
