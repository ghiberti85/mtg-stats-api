import { ApiProperty } from '@nestjs/swagger';

export class MatchupDto {
  @ApiProperty({ example: 'player1-uuid', description: 'ID do jogador 1' })
  player1!: string;

  @ApiProperty({ example: 'player2-uuid', description: 'ID do jogador 2' })
  player2!: string;

  @ApiProperty({ example: [], description: 'Lista de partidas' })
  matches!: any[];
}
