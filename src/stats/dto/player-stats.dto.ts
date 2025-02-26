import { ApiProperty } from '@nestjs/swagger';

export class PlayerStatsDto {
  @ApiProperty({ example: 'player-uuid', description: 'ID do jogador' })
  playerId!: string;

  @ApiProperty({ example: 10, description: 'Total de partidas' })
  total!: number;

  @ApiProperty({ example: 6, description: 'Total de vitórias' })
  wins!: number;

  @ApiProperty({ example: 60, description: 'Taxa de vitória (%)' })
  winRate!: number;
}
