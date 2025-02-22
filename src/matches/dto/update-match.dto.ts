import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { MatchResult } from '../../enums/match-result.enum';

export class UpdateMatchDto {
  @ApiProperty({
    example: 'uuid-jogador',
    description: 'ID do jogador',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  player_id?: string;

  @ApiProperty({
    example: 'uuid-deck',
    description: 'ID do deck usado',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  deck_id?: string;

  @ApiProperty({
    example: 'modern',
    description: 'Formato do jogo',
    required: false,
  })
  @IsString()
  @IsOptional()
  format?: string;

  @ApiProperty({
    example: 'win',
    enum: MatchResult,
    description: 'Resultado da partida (win ou loss)',
    required: false,
  })
  @IsEnum(MatchResult)
  @IsOptional()
  result?: MatchResult;

  @ApiProperty({
    example: 30,
    description: 'Duração da partida em minutos',
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number;
}
