import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { Match } from './entities/match.entity';
import { supabase } from '../supabaseClient';

@Injectable()
export class MatchesService {
  async createMatch(dto: CreateMatchDto): Promise<Match> {
    if (!dto.player_id || !dto.deck_id) {
      throw new InternalServerErrorException(
        'Error creating match: player_id e deck_id são obrigatórios.',
      );
    }
    const {
      data,
      error,
    }: { data: Match | null; error: { message: string } | null } =
      await supabase.from('matches').insert(dto).select().maybeSingle();

    if (error) {
      throw new InternalServerErrorException(
        `Error creating match: ${error.message}`,
      );
    }
    if (!data) {
      throw new InternalServerErrorException(
        'Error creating match: Dados retornados estão indefinidos.',
      );
    }
    return data;
  }

  async getMatchById(id: string): Promise<Match> {
    const {
      data,
      error,
    }: { data: Match | null; error: { message: string } | null } =
      await supabase.from('matches').select().eq('id', id).maybeSingle();

    if (error) {
      throw new InternalServerErrorException(
        `Error retrieving match: ${error.message}`,
      );
    }
    if (!data) {
      throw new NotFoundException('Match not found');
    }
    return data;
  }

  async getMatches(playerId?: string): Promise<Match[]> {
    let query = supabase.from('matches').select();

    if (playerId) {
      query = query.eq('player_id', playerId);
    }

    const { data, error } = await query;
    if (error) {
      throw new InternalServerErrorException(
        `Error searching for matches: ${error.message}`,
      );
    }
    return data as Match[];
  }

  async updateMatch(id: string, dto: UpdateMatchDto): Promise<Match> {
    const {
      data,
      error,
    }: { data: Match | null; error: { message: string } | null } =
      await supabase.from('matches').update(dto).select().maybeSingle();

    if (error) {
      throw new InternalServerErrorException(
        `Error updating match: ${error.message}`,
      );
    }
    if (!data) {
      throw new NotFoundException('Match not found');
    }
    return data;
  }

  async deleteMatch(id: string): Promise<{ message: string }> {
    const {
      data,
      error,
    }: { data: Match[] | null; error: { message: string } | null } =
      await supabase.from('matches').delete().eq('id', id);

    if (error) {
      throw new InternalServerErrorException(
        `Error deleting match: ${error.message}`,
      );
    }
    if (!data || (Array.isArray(data) && (data as Match[]).length === 0)) {
      throw new NotFoundException('Match not found');
    }
    return { message: 'Match removed successfully.' };
  }

  async getMatchesByPlayer(playerId: string): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select()
      .or(`player_id.eq.${playerId},opponent_id.eq.${playerId}`);

    if (error) {
      throw new InternalServerErrorException(
        `Error retrieving matches for player ${playerId}: ${error.message}`,
      );
    }
    return data as Match[];
  }

  async getMatchesByDeck(deckId: string): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select()
      .or(`deck_id.eq.${deckId},opponent_deck_id.eq.${deckId}`);

    if (error) {
      throw new InternalServerErrorException(
        `Error retrieving matches for deck ${deckId}: ${error.message}`,
      );
    }
    return data as Match[];
  }

  async getMatchupHistory(
    playerId: string,
    opponentId: string,
  ): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select()
      .or(`player_id.eq.${playerId},opponent_id.eq.${opponentId}`);

    if (error) {
      throw new InternalServerErrorException(
        `Error retrieving matchup history between players ${playerId} and ${opponentId}: ${error.message}`,
      );
    }
    return data as Match[];
  }

  async getAllPlayers(): Promise<Match[]> {
    const { data, error } = await supabase.from('players').select();
    if (error) {
      throw new InternalServerErrorException(
        `Error retrieving players: ${error.message}`,
      );
    }
    return data as Match[];
  }
}
