import { ApiProperty } from '@nestjs/swagger';

export class PlayerStatsDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  playerId: string;

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 6 })
  wins: number;

  @ApiProperty({ example: 60 })
  winRate: number;
}
