import { ApiProperty } from '@nestjs/swagger';

export class DeckStatsDto {
  @ApiProperty({ example: 'Mono Red Aggro' })
  deckId: string;

  @ApiProperty({ example: 15 })
  total: number;

  @ApiProperty({ example: 9 })
  wins: number;

  @ApiProperty({ example: 60 })
  winRate: number;
}
