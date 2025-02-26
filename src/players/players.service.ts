// src/players/players.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { supabase } from '../supabaseClient';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

interface Match {
  player_id: string;
  deck_id: string;
  format: string;
  result: 'WIN' | 'LOSS' | 'DRAW';
  duration: number;
  match_date: string;
}

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

    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new InternalServerErrorException('No data returned from Supabase.');
    }

    return data[0];
  }

  async getPlayerById(playerId: string): Promise<CreatePlayerDto> {
    const {
      data,
      error,
    }: { data: CreatePlayerDto | null; error: { message: string } | null } =
      await supabase.from('players').select().eq('id', playerId).maybeSingle();

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

  async getPlayerStats(playerId: string) {
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .eq('player_id', playerId);

    if (error || !matches || matches.length === 0) {
      throw new NotFoundException(`No matches found for player ${playerId}`);
    }

    // 🔹 Garante que `matches` é um array de `Match`
    const typedMatches: Match[] = matches as Match[];

    const totalMatches = typedMatches.length;
    const wins = typedMatches.filter((m) => m.result === 'WIN').length;
    const losses = totalMatches - wins;
    const winRate = Math.round((wins / totalMatches) * 100);

    // 🔹 Melhor deck do jogador
    const deckPerformance: Record<string, number> = {};
    typedMatches.forEach((match) => {
      if (!deckPerformance[match.deck_id]) deckPerformance[match.deck_id] = 0;
      if (match.result === 'WIN') deckPerformance[match.deck_id] += 1;
    });
    const bestDeck = Object.keys(deckPerformance).reduce((a, b) =>
      deckPerformance[a] > deckPerformance[b] ? a : b,
    );

    // 🔹 Histórico de desempenho ao longo do tempo
    const performanceMap: Record<string, { wins: number; total: number }> = {};
    typedMatches.forEach((match) => {
      const matchDate = match.match_date.split('T')[0]; // YYYY-MM-DD
      if (!performanceMap[matchDate])
        performanceMap[matchDate] = { wins: 0, total: 0 };
      performanceMap[matchDate].total++;
      if (match.result === 'WIN') performanceMap[matchDate].wins++;
    });

    // 🔹 Converte o histórico para um array tipado
    const performanceHistory = Object.keys(performanceMap).map((date) => ({
      date,
      winRate: Math.round(
        (performanceMap[date].wins / performanceMap[date].total) * 100,
      ),
    }));

    return {
      playerId,
      totalMatches,
      wins,
      losses,
      winRate,
      bestDeck,
      performanceHistory,
    };
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
        .maybeSingle();

    if (error) {
      throw new NotFoundException(
        `Player with id ${playerId} not found or update failed: ${error.message}`,
      );
    }
    if (!data || !Array.isArray(data) || data.length === 0) {
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
    }: { data: { id: string }[] | null; error: { message: string } | null } =
      (await supabase
        .from('players')
        .delete()
        .eq('id', playerId)
        .maybeSingle()) as {
        data: { id: string }[] | null;
        error: { message: string } | null;
      };

    if (error) {
      throw new NotFoundException(
        `Player with id ${playerId} not found or deletion failed: ${error.message}`,
      );
    }
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new NotFoundException(
        `Player with id ${playerId} not found or deletion failed.`,
      );
    }
    return { message: 'Player deleted successfully' };
  }
}
