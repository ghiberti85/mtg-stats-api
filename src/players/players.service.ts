// src/players/players.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { supabase } from '../supabaseClient';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@Injectable()
export class PlayersService {
  async createPlayer(
    createPlayerDto: CreatePlayerDto,
  ): Promise<CreatePlayerDto> {
    const {
      data,
      error,
    }: { data: CreatePlayerDto[] | null; error: { message: string } | null } =
      await supabase.from('players').insert([createPlayerDto]).select();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!data || data.length === 0) {
      throw new InternalServerErrorException('No data returned from Supabase.');
    }
    return data[0];
  }

  async getPlayerById(playerId: string): Promise<CreatePlayerDto> {
    const {
      data,
      error,
    }: { data: CreatePlayerDto | null; error: { message: string } | null } =
      await supabase.from('players').select('*').eq('id', playerId).single();

    if (error || !data) {
      throw new NotFoundException(`Player with id ${playerId} not found.`);
    }
    return data;
  }

  async getPlayers(): Promise<CreatePlayerDto[]> {
    const {
      data,
      error,
    }: { data: CreatePlayerDto[] | null; error: { message: string } | null } =
      await supabase.from('players').select('*');

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return data ?? [];
  }

  async updatePlayer(playerId: string, updatePlayerDto: UpdatePlayerDto) {
    const {
      data,
      error,
    }: { data: UpdatePlayerDto[] | null; error: { message: string } | null } =
      await supabase
        .from('players')
        .update(updatePlayerDto)
        .eq('id', playerId)
        .select();

    if (error) {
      throw new NotFoundException(
        `Player with id ${playerId} not found or update failed: ${error.message}`,
      );
    }
    if (!data || data.length === 0) {
      throw new NotFoundException(
        `Player with id ${playerId} not found or update failed.`,
      );
    }
    return data[0];
  }

  async deletePlayer(playerId: string) {
    const {
      data,
      error,
    }: { data: any[] | null; error: { message: string } | null } =
      await supabase.from('players').delete().eq('id', playerId).select();

    if (error) {
      throw new NotFoundException(
        `Player with id ${playerId} not found or deletion failed: ${error.message}`,
      );
    }
    if (!data || data.length === 0) {
      throw new NotFoundException(
        `Player with id ${playerId} not found or deletion failed.`,
      );
    }
    return { message: 'Player deleted successfully' };
  }
}
