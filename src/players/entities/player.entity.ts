// src/players/entities/player.entity.ts
import { CreatePlayerDto } from '../dto/create-player.dto';

export interface PlayerDto extends CreatePlayerDto {
  id: string;
}
