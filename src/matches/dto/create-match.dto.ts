import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsUUID,
  IsOptional,
  IsInt,
  Min,
  IsISO8601,
} from 'class-validator';
import { MatchResult } from '../../enums/match-result.enum';

export class CreateMatchDto {
  @ApiProperty({ example: 'uuid-jogador', description: 'ID do jogador' })
  @IsUUID()
  player_id!: string;

  @ApiProperty({
    example: 'uuid-oponente',
    description: 'ID do oponente',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  opponent_id?: string;

  @ApiProperty({ example: 'uuid-deck', description: 'ID do deck usado' })
  @IsUUID()
  deck_id!: string;

  @ApiProperty({
    example: 'uuid-deck-oponente',
    description: 'ID do deck do oponente',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  opponent_deck_id?: string;

  @ApiProperty({ example: 'modern', description: 'Formato do jogo' })
  @IsString()
  format!: string;

  @IsEnum(MatchResult, { message: 'O resultado deve ser win, loss ou draw' })
  @ApiProperty({
    example: 'win',
    enum: MatchResult,
    description: 'Resultado da partida (win, loss ou draw)',
  })
  result!: MatchResult | keyof typeof MatchResult;

  @ApiProperty({
    example: 30,
    description: 'Duração da partida em minutos',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  duration!: number;

  @ApiProperty({
    example: '2025-02-19T14:30:00.000Z',
    description: 'Data e hora da partida',
    required: false,
  })
  @IsOptional()
  @IsISO8601()
  match_date?: string;
}
