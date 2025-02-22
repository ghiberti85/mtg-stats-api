import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardDto {
  @ApiProperty({ example: 'Jogador1' })
  player: string;

  @ApiProperty({ example: 75 })
  winRate: number;
}
