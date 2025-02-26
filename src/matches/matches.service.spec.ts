import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { MatchResult } from '../enums/match-result.enum';
import { supabase } from '../supabaseClient';
import { Match } from '../matches/entities/match.entity'; // Adjust the path as necessary

const testPlayerId = '550e8400-e29b-41d4-a716-446655440000';
const testOpponentId = '550e8400-e29b-41d4-a716-446655440001';
const testDeckId = '550e8400-e29b-41d4-a716-446655440002';
const testOpponentDeckId = '550e8400-e29b-41d4-a716-446655440003';

let matchId: string;

beforeAll(async () => {
  console.log('🔹 Criando registros de teste no Supabase...');

  // Criar jogadores
  const { error: playerError } = await supabase.from('players').insert([
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Jogador Teste',
      email: 'jogador.teste@example.com', // ✅ Adicionando email, se obrigatório
      created_at: new Date().toISOString(), // ✅ Se a tabela exige
    },
  ]);

  if (playerError) {
    console.error('🚨 Erro ao criar jogador de teste:', playerError);
    throw new Error('Falha ao inserir jogador no Supabase.');
  }

  if (playerError) {
    console.error('🚨 Erro ao criar jogadores:', playerError);
    throw new Error('Falha ao inserir jogadores no Supabase.');
  }

  // Criar decks
  const { error: deckError } = await supabase.from('decks').insert([
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      player_id: '550e8400-e29b-41d4-a716-446655440000', // ✅ Adicionando um player_id válido
      name: 'Deck Principal',
      format: 'standard',
      created_at: new Date().toISOString(), // Se necessário
    },
  ]);

  if (deckError) {
    console.error('🚨 Erro ao criar decks:', deckError);
    throw new Error('Falha ao inserir decks no Supabase.');
  }

  // Validar inserção
  const { data: players } = await supabase.from('players').select('id');
  const { data: decks } = await supabase.from('decks').select('id');

  console.log('✅ Jogadores criados:', players);
  console.log('✅ Decks criados:', decks);
});

afterAll(async () => {
  console.log('🗑️ Removendo registros de teste do Supabase...');

  await supabase.from('matches').delete().eq('player_id', testPlayerId);
  await supabase.from('players').delete().eq('id', testPlayerId);
  await supabase.from('players').delete().eq('id', testOpponentId);
  await supabase.from('decks').delete().eq('id', testDeckId);
  await supabase.from('decks').delete().eq('id', testOpponentDeckId);
});

describe('MatchesService', () => {
  let service: MatchesService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchesService],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve criar uma partida com sucesso', async () => {
    const createMatchDto: CreateMatchDto = {
      player_id: '550e8400-e29b-41d4-a716-446655440000',
      opponent_id: '550e8400-e29b-41d4-a716-446655440001',
      deck_id: '550e8400-e29b-41d4-a716-446655440002',
      opponent_deck_id: '550e8400-e29b-41d4-a716-446655440003',
      format: 'standard',
      duration: 30,
      result: MatchResult.WIN,
    };

    const match = await service.createMatch(createMatchDto);
    expect(match).toBeDefined();
    expect((match as Match).id).toBeDefined(); // ✅ Garantimos que `id` existe na resposta
    matchId = (match as Match).id; // ✅ Armazena corretamente o ID
  });

  it('deve lançar erro ao criar uma partida inválida', async () => {
    await expect(service.createMatch({} as any)).rejects.toThrow(
      new Error('Error creating match: player_id e deck_id são obrigatórios.'),
    );
  });

  it('deve retornar uma partida por ID', async () => {
    const match = await service.getMatchById(matchId);
    expect(match).toBeDefined();
    expect((match as Match).id).toBe(matchId);
  });

  it('deve lançar erro ao buscar uma partida inexistente', async () => {
    await expect(service.getMatchById('non-existent-uuid')).rejects.toThrow();
  });

  it('deve atualizar uma partida com sucesso', async () => {
    const updateMatchDto = { result: MatchResult.LOSS };
    const updatedMatch = await service.updateMatch(matchId, updateMatchDto);
    expect(updatedMatch).toBeDefined();
    expect(updatedMatch.result).toBe(MatchResult.LOSS);
  });

  it('deve lançar erro ao atualizar uma partida inexistente', async () => {
    await expect(
      service.updateMatch('non-existent-uuid', { result: MatchResult.WIN }),
    ).rejects.toThrow();
  });

  it('deve deletar uma partida com sucesso', async () => {
    const response = await service.deleteMatch(matchId);
    expect(response).toEqual({ message: 'Match removed successfully.' });
  });

  it('deve lançar erro ao deletar uma partida inexistente', async () => {
    await expect(service.deleteMatch('non-existent-uuid')).rejects.toThrow();
  });
});
