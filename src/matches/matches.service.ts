import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

// ✅ Carrega variáveis do .env
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;

// ✅ Inicializa corretamente o Supabase Client
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
);

/**
 * Tipo genérico para respostas do Supabase
 */
type SupabaseResponse<T> = {
  data: T | null;
  error: { message: string } | null;
};

type MatchResult = 'win' | 'loss' | 'draw';

interface Match {
  id: string;
  player_id: string;
  opponent_id?: string;
  deck_id: string;
  opponent_deck_id?: string;
  format: string;
  duration: number;
  result: MatchResult;
}

@Injectable()
export class MatchesService {
  async createMatch(createMatchDto: CreateMatchDto): Promise<Match> {
    console.log(
      '📌 Dados recebidos antes da inserção:',
      JSON.stringify(createMatchDto, null, 2),
    );

    if (!createMatchDto.player_id || !createMatchDto.deck_id) {
      throw new InternalServerErrorException(
        'Error creating match: player_id e deck_id são obrigatórios.',
      );
    }

    const { data, error } = await supabase
      .from('matches')
      .insert([{ ...createMatchDto }])
      .select(
        'id, player_id, opponent_id, deck_id, opponent_deck_id, format, duration, result',
      )
      .maybeSingle();

    console.log(
      '📌 Dados retornados pelo Supabase:',
      JSON.stringify(data, null, 2),
    );

    if (error) {
      console.error('🚨 Erro na inserção:', error);
      throw new InternalServerErrorException(
        `Error creating match: ${error.message}`,
      );
    }

    if (!data) {
      throw new InternalServerErrorException(
        'Error creating match: Dados retornados estão indefinidos.',
      );
    }

    return data as Match; // ✅ Garante que TypeScript entenda o tipo correto
  }

  // ✅ Busca uma partida pelo ID
  async getMatchById(id: string): Promise<CreateMatchDto> {
    const { data, error }: SupabaseResponse<CreateMatchDto> = await supabase
      .from('matches')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      throw new NotFoundException(`Match with ID ${id} not found.`);
    }

    return data;
  }

  // ✅ Lista todas as partidas, opcionalmente filtrando por jogador
  async getMatches(playerId?: string): Promise<CreateMatchDto[]> {
    let query = supabase.from('matches').select('*');

    if (playerId) {
      query = query.eq('player_id', playerId);
    }

    const { data, error }: SupabaseResponse<CreateMatchDto[]> = await query;

    if (error) {
      throw new InternalServerErrorException(
        `Error searching for matches: ${error.message}`,
      );
    }

    return data ?? [];
  }

  // ✅ Atualiza uma partida pelo ID e retorna os dados atualizados
  async updateMatch(
    matchId: string,
    updateMatchDto: UpdateMatchDto,
  ): Promise<UpdateMatchDto> {
    const { data, error }: SupabaseResponse<UpdateMatchDto> = await supabase
      .from('matches')
      .update(updateMatchDto)
      .eq('id', matchId)
      .select('*')
      .maybeSingle();

    if (error || !data) {
      throw new NotFoundException(`Error updating match ${matchId}.`);
    }

    return data;
  }

  // ✅ Remove uma partida pelo ID e retorna uma mensagem de sucesso
  async deleteMatch(matchId: string): Promise<{ message: string }> {
    const { data, error }: SupabaseResponse<CreateMatchDto> = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId)
      .select('*')
      .maybeSingle();

    if (error || !data) {
      throw new NotFoundException(`Match with ID ${matchId} not found.`);
    }

    return { message: 'Match removed successfully.' };
  }

  // ✅ Obtém todas as partidas de um jogador
  async getMatchesByPlayer(playerId: string): Promise<CreateMatchDto[]> {
    const { data, error }: SupabaseResponse<CreateMatchDto[]> = await supabase
      .from('matches')
      .select('*')
      .or(`player_id.eq.${playerId},opponent_deck_id.eq.${playerId}`);

    if (error) {
      throw new InternalServerErrorException(
        `Error retrieving matches for player ${playerId}: ${error.message}`,
      );
    }

    return data ?? [];
  }

  // ✅ Obtém todas as partidas onde um determinado deck foi usado
  async getMatchesByDeck(deckId: string): Promise<CreateMatchDto[]> {
    const { data, error }: SupabaseResponse<CreateMatchDto[]> = await supabase
      .from('matches')
      .select('*')
      .or(`deck_id.eq.${deckId},opponent_deck_id.eq.${deckId}`);

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
    const { data, error }: SupabaseResponse<CreateMatchDto[]> = await supabase
      .from('matches')
      .select('*')
      .or(
        `player_id.eq.${player1},opponent_deck_id.eq.${player2},player_id.eq.${player2},opponent_deck_id.eq.${player1}`,
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
    const { data, error }: SupabaseResponse<{ id: string; name: string }[]> =
      await supabase.from('players').select('*');

    if (error) {
      throw new InternalServerErrorException(
        `Error retrieving players: ${error.message}`,
      );
    }

    return data ?? [];
  }
}
