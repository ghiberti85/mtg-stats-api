// src/matches/entities/match.entity.ts
import { CreateMatchDto } from '../dto/create-match.dto';

export class Match extends CreateMatchDto {
  id!: string;
}
