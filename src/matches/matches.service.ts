import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { supabase } from '../supabaseClient';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Injectable()
export class MatchesService {
  // ✅ Creates a new match and returns all fields required by the DTO
  async createMatch(createMatchDto: CreateMatchDto): Promise<CreateMatchDto> {
    const {
      data,
      error,
    }: { data: CreateMatchDto | null; error: { message: string } | null } =
      await supabase.from('matches').insert([createMatchDto]).select().single();

    if (error) {
      throw new InternalServerErrorException(
        `Error creating match: ${error.message}`,
      );
    }

    if (!data) {
      throw new InternalServerErrorException(
        'Error creating match: empty database response.',
      );
    }

    return data; // Returns all fields required by the DTO
  }

  // ✅ Retrieves a match by ID
  async getMatchById(id: string): Promise<CreateMatchDto> {
    const { data, error }: { data: CreateMatchDto | null; error: any } =
      await supabase.from('matches').select('*').eq('id', id).single();

    if (error || !data) {
      throw new NotFoundException(`Match with ID ${id} not found.`);
    }

    return data;
  }

  // ✅ Lists all matches, optionally filtering by player
  async getMatches(playerId?: string): Promise<CreateMatchDto[]> {
    let query = supabase.from('matches').select('*');

    if (playerId) {
      query = query.eq('player_id', playerId); // Correct query adjustment
    }

    const {
      data,
      error,
    }: { data: CreateMatchDto[] | null; error: { message: string } | null } =
      await query;

    if (error) {
      throw new InternalServerErrorException(
        `Error searching for matches: ${error.message}`,
      );
    }

    return data ?? [];
  }

  // ✅ Updates a match by ID and returns the updated data
  async updateMatch(
    matchId: string,
    updateMatchDto: UpdateMatchDto,
  ): Promise<UpdateMatchDto> {
    const { data, error }: { data: UpdateMatchDto | null; error: any } =
      await supabase
        .from('matches')
        .update(updateMatchDto)
        .eq('id', matchId)
        .select()
        .single();

    if (error || !data) {
      throw new NotFoundException(`Error updating match ${matchId}.`);
    }

    return data;
  }

  // ✅ Removes a match by ID and returns a success message
  async deleteMatch(matchId: string): Promise<{ message: string }> {
    const { data, error }: { data: CreateMatchDto | null; error: any } =
      await supabase
        .from('matches')
        .delete()
        .eq('id', matchId)
        .select()
        .single();

    if (error || !data) {
      throw new NotFoundException(`Match with ID ${matchId} not found.`);
    }

    return { message: 'Match removed successfully.' };
  }

  // ✅ Obtém todas as partidas de um jogador
  async getMatchesByPlayer(playerId: string): Promise<CreateMatchDto[]> {
    const {
      data,
      error,
    }: { data: CreateMatchDto[] | null; error: { message: string } | null } =
      await supabase
        .from('matches')
        .select('*')
        .or(`player_id.eq.${playerId},opponent_id.eq.${playerId}`);

    if (error) {
      throw new InternalServerErrorException(
        `Error retrieving matches for player ${playerId}: ${error.message}`,
      );
    }

    return data ?? [];
  }

  // ✅ Obtém todas as partidas onde um determinado deck foi usado
  async getMatchesByDeck(deckId: string): Promise<CreateMatchDto[]> {
    const {
      data,
      error,
    }: { data: CreateMatchDto[] | null; error: { message: string } | null } =
      await supabase
        .from('matches')
        .select('*')
        .or(`deck_used.eq.${deckId},opponent_deck.eq.${deckId}`);

    if (error) {
      throw new InternalServerErrorException(
        `Error retrieving matches for deck ${deckId}: ${error.message}`,
      );
    }

    return data ?? [];
  }

  // ✅ Obtém o histórico de confrontos entre dois jogadores
  async getMatchupHistory(
    player1: string,
    player2: string,
  ): Promise<CreateMatchDto[]> {
    const {
      data,
      error,
    }: { data: CreateMatchDto[] | null; error: { message: string } | null } =
      await supabase
        .from('matches')
        .select('*')
        .or(
          `player_id.eq.${player1},opponent_id.eq.${player2},player_id.eq.${player2},opponent_id.eq.${player1}`,
        );

    if (error) {
      throw new InternalServerErrorException(
        `Error retrieving matchup history between players ${player1} and ${player2}: ${error.message}`,
      );
    }

    return data ?? [];
  }

  // ✅ Obtém todos os jogadores registrados
  async getAllPlayers(): Promise<{ id: string; name: string }[]> {
    const {
      data,
      error,
    }: {
      data: { id: string; name: string }[] | null;
      error: { message: string } | null;
    } = await supabase.from('players').select('*');

    if (error) {
      throw new InternalServerErrorException(
        `Error retrieving players: ${error.message}`,
      );
    }

    return (data as { id: string; name: string }[]) ?? [];
  }
}
