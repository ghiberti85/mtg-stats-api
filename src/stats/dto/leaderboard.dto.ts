import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardDto {
  @ApiProperty({ example: 'player-uuid', description: 'ID do jogador' })
  player!: string;

  @ApiProperty({ example: 65, description: 'Taxa de vitória em porcentagem' })
  winRate!: number;
}
