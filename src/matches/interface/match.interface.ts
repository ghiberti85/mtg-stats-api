// src/matches/interfaces/match.interface.ts
import { CreateMatchDto } from '../dto/create-match.dto'; // Ensure this path is correct or update it to the correct path

export interface MatchRecord extends CreateMatchDto {
  id: string;
}
