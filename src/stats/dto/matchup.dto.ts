import { ApiProperty } from '@nestjs/swagger';

export class MatchupDto {
  @ApiProperty({ example: 'player1-id' })
  player1: string;

  @ApiProperty({ example: 'player2-id' })
  player2: string;

  @ApiProperty({ example: [{ result: 'WIN', date: '2024-02-22T12:00:00Z' }] })
  matches: any[];
}
