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
  ): Promise<CreateMatchDto> {
    const { data, error }: { data: CreateMatchDto | null; error: any } =
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
}
