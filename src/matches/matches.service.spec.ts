import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { MatchResult } from '../enums/match-result.enum';
import { supabase } from '../supabaseClient';
import { Match } from './entities/match.entity';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

/** Constantes de teste */
const testPlayerId = '550e8400-e29b-41d4-a716-446655440000';
const testOpponentId = '550e8400-e29b-41d4-a716-446655440001';
const testDeckId = '550e8400-e29b-41d4-a716-446655440002';
const testOpponentDeckId = '550e8400-e29b-41d4-a716-446655440003';

const validCreateMatchDto: CreateMatchDto = {
  player_id: testPlayerId,
  opponent_id: testOpponentId,
  deck_id: testDeckId,
  opponent_deck_id: testOpponentDeckId,
  format: 'standard',
  duration: 30,
  result: MatchResult.WIN,
};

/**
 * Helpers para simular as cadeias de métodos do Supabase.
 */
const createMockChainInsert = (result: { data: any; error: any }) => ({
  insert: jest.fn(() => ({
    select: jest.fn(() => ({
      maybeSingle: jest.fn(() => Promise.resolve(result)),
    })),
  })),
});

const createMockChainSelectEqMaybeSingle = (result: {
  data: any;
  error: any;
}) => ({
  select: jest.fn(() => ({
    eq: jest.fn(() => ({
      maybeSingle: jest.fn(() => Promise.resolve(result)),
    })),
  })),
});

const createMockChainSelectWithEq = (result: { data: any; error: any }) => ({
  select: jest.fn(() => ({
    eq: jest.fn(() => Promise.resolve(result)),
  })),
});

const createMockChainSelect = (result: { data: any; error: any }) => ({
  select: jest.fn(() => Promise.resolve(result)),
});

const createMockChainUpdate = (result: { data: any; error: any }) => ({
  update: jest.fn(() => ({
    select: jest.fn(() => ({
      maybeSingle: jest.fn(() => Promise.resolve(result)),
    })),
  })),
});

const createMockChainDelete = (result: { data: any; error: any }) => ({
  delete: jest.fn(() => ({
    eq: jest.fn(() => Promise.resolve(result)),
  })),
});

const createMockChainSelectOr = (result: { data: any; error: any }) => ({
  select: jest.fn(() => ({
    or: jest.fn(() => Promise.resolve(result)),
  })),
});

describe('MatchesService', () => {
  let service: MatchesService;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const originalFrom: typeof supabase.from = supabase.from.bind(supabase);

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchesService],
    }).compile();
    service = module.get<MatchesService>(MatchesService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // -------------------- Testes de createMatch --------------------
  describe('createMatch', () => {
    it('deve criar uma partida com sucesso', async () => {
      const mockMatch: Partial<Match> = {
        id: 'match-success-id',
        ...validCreateMatchDto,
      };
      jest.spyOn(supabase, 'from').mockImplementation((relation: string) => {
        if (relation === 'matches') {
          return createMockChainInsert({
            data: mockMatch,
            error: null,
          }) as unknown as ReturnType<typeof supabase.from>;
        }
        return originalFrom(relation);
      });
      const result = await service.createMatch(validCreateMatchDto);
      expect(result).toBeDefined();
      expect(result.id).toEqual('match-success-id');
    });

    it('deve lançar erro se campos obrigatórios estiverem faltando', async () => {
      await expect(service.createMatch({} as CreateMatchDto)).rejects.toThrow(
        new InternalServerErrorException(
          'Error creating match: player_id e deck_id são obrigatórios.',
        ),
      );
    });

    it('deve lançar erro se o Supabase retornar erro', async () => {
      const errorMock = { message: 'Constraint error', code: '23503' };
      jest.spyOn(supabase, 'from').mockImplementation((relation: string) => {
        if (relation === 'matches') {
          return createMockChainInsert({
            data: null,
            error: errorMock,
          }) as unknown as ReturnType<typeof supabase.from>;
        }
        return originalFrom(relation);
      });
      await expect(service.createMatch(validCreateMatchDto)).rejects.toThrow(
        new InternalServerErrorException(
          'Error creating match: Constraint error',
        ),
      );
    });

    it('deve lançar erro se o Supabase retornar dados indefinidos', async () => {
      jest.spyOn(supabase, 'from').mockImplementation((relation: string) => {
        if (relation === 'matches') {
          return createMockChainInsert({
            data: null,
            error: null,
          }) as unknown as ReturnType<typeof supabase.from>;
        }
        return originalFrom(relation);
      });
      await expect(service.createMatch(validCreateMatchDto)).rejects.toThrow(
        new InternalServerErrorException(
          'Error creating match: Dados retornados estão indefinidos.',
        ),
      );
    });
  });

  // -------------------- Testes de getMatchById --------------------
  describe('getMatchById', () => {
    it('deve retornar uma partida pelo ID', async () => {
      const mockMatch: Partial<Match> = {
        id: 'match-by-id',
        player_id: testPlayerId,
        opponent_id: testOpponentId,
        deck_id: testDeckId,
        opponent_deck_id: testOpponentDeckId,
        format: 'standard',
        duration: 30,
        result: MatchResult.WIN,
      };
      jest.spyOn(supabase, 'from').mockImplementation((relation: string) => {
        if (relation === 'matches') {
          return createMockChainSelectEqMaybeSingle({
            data: mockMatch,
            error: null,
          }) as unknown as ReturnType<typeof supabase.from>;
        }
        return originalFrom(relation);
      });
      const result = await service.getMatchById('match-by-id');
      expect(result).toBeDefined();
      expect(result.id).toEqual('match-by-id');
    });

    it('deve lançar NotFoundException se a partida não for encontrada', async () => {
      jest.spyOn(supabase, 'from').mockImplementation((relation: string) => {
        if (relation === 'matches') {
          return createMockChainSelectEqMaybeSingle({
            data: null,
            error: null,
          }) as unknown as ReturnType<typeof supabase.from>;
        }
        return originalFrom(relation);
      });
      await expect(service.getMatchById('non-existent-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // -------------------- Testes de getMatches --------------------
  describe('getMatches', () => {
    it('deve lançar erro se o Supabase retornar um erro', async () => {
      jest.spyOn(supabase, 'from').mockImplementation((relation: string) => {
        if (relation === 'matches') {
          return {
            select: jest.fn(() =>
              Promise.resolve({
                data: null,
                error: { message: 'Query error' },
              }),
            ),
          } as unknown as ReturnType<typeof supabase.from>;
        }
        return originalFrom(relation);
      });
      await expect(service.getMatches()).rejects.toThrow(
        new InternalServerErrorException(
          'Error searching for matches: Query error',
        ),
      );
    });

    it('deve retornar partidas filtradas por playerId', async () => {
      const mockMatches = [
        {
          id: 'match-filtered-id',
          player_id: testPlayerId,
          opponent_id: testOpponentId,
          deck_id: testDeckId,
          opponent_deck_id: testOpponentDeckId,
          format: 'standard',
          duration: 30,
          result: 'win',
        },
      ];
      jest.spyOn(supabase, 'from').mockImplementation((relation: string) => {
        if (relation === 'matches') {
          return createMockChainSelectWithEq({
            data: mockMatches,
            error: null,
          }) as unknown as ReturnType<typeof supabase.from>;
        }
        return originalFrom(relation);
      });
      const result = await service.getMatches(testPlayerId);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      result.forEach((match) => expect(match.player_id).toEqual(testPlayerId));
    });
  });

  // -------------------- Testes de updateMatch --------------------
  describe('updateMatch', () => {
    it('deve atualizar uma partida com sucesso', async () => {
      const updatedMatch: Partial<Match> = {
        id: 'match-update-id',
        result: MatchResult.LOSS,
        player_id: testPlayerId,
        opponent_id: testOpponentId,
        deck_id: testDeckId,
        opponent_deck_id: testOpponentDeckId,
        format: 'standard',
        duration: 30,
      };
      jest.spyOn(supabase, 'from').mockImplementation((relation: string) => {
        if (relation === 'matches') {
          return createMockChainUpdate({
            data: updatedMatch,
            error: null,
          }) as unknown as ReturnType<typeof supabase.from>;
        }
        return originalFrom(relation);
      });
      const result = await service.updateMatch('match-update-id', {
        result: MatchResult.LOSS,
      });
      expect(result).toBeDefined();
      expect(result.result).toEqual(MatchResult.LOSS);
    });

    it('deve lançar NotFoundException se a partida não existir', async () => {
      jest.spyOn(supabase, 'from').mockImplementation((relation: string) => {
        if (relation === 'matches') {
          return createMockChainUpdate({
            data: null,
            error: null,
          }) as unknown as ReturnType<typeof supabase.from>;
        }
        return originalFrom(relation);
      });
      await expect(
        service.updateMatch('non-existent-uuid', { result: MatchResult.WIN }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // -------------------- Testes de deleteMatch --------------------
  describe('deleteMatch', () => {
    it('deve deletar uma partida com sucesso', async () => {
      const mockData = [{ id: 'match-delete-id' }];
      jest.spyOn(supabase, 'from').mockImplementation((relation: string) => {
        if (relation === 'matches') {
          return createMockChainDelete({
            data: mockData,
            error: null,
          }) as unknown as ReturnType<typeof supabase.from>;
        }
        return originalFrom(relation);
      });
      const result = await service.deleteMatch('match-delete-id');
      expect(result).toEqual({ message: 'Match removed successfully.' });
    });

    it('deve lançar NotFoundException se a partida a ser deletada não existir', async () => {
      jest.spyOn(supabase, 'from').mockImplementation((relation: string) => {
        if (relation === 'matches') {
          return createMockChainDelete({
            data: [],
            error: null,
          }) as unknown as ReturnType<typeof supabase.from>;
        }
        return originalFrom(relation);
      });
      await expect(service.deleteMatch('non-existent-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // -------------------- Testes de getMatchesByPlayer --------------------
  describe('getMatchesByPlayer', () => {
    it('deve retornar partidas de um jogador', async () => {
      const mockMatches = [
        {
          id: 'match-player-id',
          player_id: testPlayerId,
          opponent_id: testOpponentId,
          deck_id: testDeckId,
          opponent_deck_id: testOpponentDeckId,
          format: 'standard',
          duration: 30,
          result: 'win',
        },
      ];
      jest.spyOn(supabase, 'from').mockImplementation((relation: string) => {
        if (relation === 'matches') {
          return createMockChainSelectOr({
            data: mockMatches,
            error: null,
          }) as unknown as ReturnType<typeof supabase.from>;
        }
        return originalFrom(relation);
      });
      const result = await service.getMatchesByPlayer(testPlayerId);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('deve lançar erro se o Supabase retornar erro em getMatchesByPlayer', async () => {
      jest.spyOn(supabase, 'from').mockImplementation((relation: string) => {
        if (relation === 'matches') {
          return createMockChainSelectOr({
            data: null,
            error: { message: 'Query error for player' },
          }) as unknown as ReturnType<typeof supabase.from>;
        }
        return originalFrom(relation);
      });
      await expect(service.getMatchesByPlayer(testPlayerId)).rejects.toThrow(
        new InternalServerErrorException(
          `Error retrieving matches for player ${testPlayerId}: Query error for player`,
        ),
      );
    });
  });

  // -------------------- Testes de getMatchesByDeck --------------------
  describe('getMatchesByDeck', () => {
    it('deve retornar partidas para um deck', async () => {
      const mockMatches = [
        {
          id: 'match-deck-id',
          deck_id: testDeckId,
          player_id: testPlayerId,
          opponent_id: testOpponentId,
          opponent_deck_id: testOpponentDeckId,
          format: 'standard',
          duration: 30,
          result: 'win',
        },
      ];
      jest.spyOn(supabase, 'from').mockImplementation((relation: string) => {
        if (relation === 'matches') {
          return createMockChainSelectOr({
            data: mockMatches,
            error: null,
          }) as unknown as ReturnType<typeof supabase.from>;
        }
        return originalFrom(relation);
      });
      const result = await service.getMatchesByDeck(testDeckId);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('deve lançar erro se o Supabase retornar erro em getMatchesByDeck', async () => {
      jest.spyOn(supabase, 'from').mockImplementation((relation: string) => {
        if (relation === 'matches') {
          return createMockChainSelectOr({
            data: null,
            error: { message: 'Query error for deck' },
          }) as unknown as ReturnType<typeof supabase.from>;
        }
        return originalFrom(relation);
      });
      await expect(service.getMatchesByDeck(testDeckId)).rejects.toThrow(
        new InternalServerErrorException(
          `Error retrieving matches for deck ${testDeckId}: Query error for deck`,
        ),
      );
    });
  });

  // -------------------- Testes de getMatchupHistory --------------------
  describe('getMatchupHistory', () => {
    it('deve retornar histórico de confrontos entre dois jogadores', async () => {
      const mockMatches = [
        {
          id: 'matchup-history-id',
          player_id: testPlayerId,
          opponent_id: testOpponentId,
          deck_id: testDeckId,
          opponent_deck_id: testOpponentDeckId,
          format: 'standard',
          duration: 30,
          result: 'win',
        },
      ];
      jest.spyOn(supabase, 'from').mockImplementation((relation: string) => {
        if (relation === 'matches') {
          return createMockChainSelectOr({
            data: mockMatches,
            error: null,
          }) as unknown as ReturnType<typeof supabase.from>;
        }
        return originalFrom(relation);
      });
      const result = await service.getMatchupHistory(
        testPlayerId,
        testOpponentId,
      );
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('deve lançar erro se o Supabase retornar erro em getMatchupHistory', async () => {
      jest.spyOn(supabase, 'from').mockImplementation((relation: string) => {
        if (relation === 'matches') {
          return createMockChainSelectOr({
            data: null,
            error: { message: 'Query error for matchup' },
          }) as unknown as ReturnType<typeof supabase.from>;
        }
        return originalFrom(relation);
      });
      await expect(
        service.getMatchupHistory(testPlayerId, testOpponentId),
      ).rejects.toThrow(
        new InternalServerErrorException(
          `Error retrieving matchup history between players ${testPlayerId} and ${testOpponentId}: Query error for matchup`,
        ),
      );
    });
  });

  // -------------------- Testes de getAllPlayers --------------------
  describe('getAllPlayers', () => {
    it('deve retornar todos os jogadores', async () => {
      const mockPlayers = [{ id: testPlayerId, name: 'Jogador Teste' }];
      jest.spyOn(supabase, 'from').mockImplementation((relation: string) => {
        if (relation === 'players') {
          return createMockChainSelect({
            data: mockPlayers,
            error: null,
          }) as unknown as ReturnType<typeof supabase.from>;
        }
        return originalFrom(relation);
      });
      const result = await service.getAllPlayers();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('deve lançar erro se o Supabase retornar erro em getAllPlayers', async () => {
      jest.spyOn(supabase, 'from').mockImplementation((relation: string) => {
        if (relation === 'players') {
          return createMockChainSelect({
            data: null,
            error: { message: 'Players query error' },
          }) as unknown as ReturnType<typeof supabase.from>;
        }
        return originalFrom(relation);
      });
      await expect(service.getAllPlayers()).rejects.toThrow(
        new InternalServerErrorException(
          'Error retrieving players: Players query error',
        ),
      );
    });
  });
});
