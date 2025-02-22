import { ApiProperty } from '@nestjs/swagger';
import { DeckStatsDto } from './deck-stats.dto';

export class CompareDecksDto {
  @ApiProperty({ type: DeckStatsDto })
  deck1: DeckStatsDto;

  @ApiProperty({ type: DeckStatsDto })
  deck2: DeckStatsDto;
}
