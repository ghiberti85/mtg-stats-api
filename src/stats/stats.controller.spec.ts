import { Test, TestingModule } from '@nestjs/testing';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { MatchResult } from '../enums/match-result.enum';

describe('StatsController', () => {
  let controller: StatsController;
  let service: StatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [
        {
          provide: StatsService,
          useValue: {
            getPlayerStats: jest.fn(),
            getDeckStats: jest.fn(),
            getMatchup: jest.fn(),
            compareDecks: jest.fn(),
            getLeaderboard: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StatsController>(StatsController);
    service = module.get<StatsService>(StatsService);
  });

  it('deve obter estatísticas de um jogador', async () => {
    const mockStats = { playerId: '123', total: 10, wins: 6, winRate: 60 };
    jest.spyOn(service, 'getPlayerStats').mockResolvedValue(mockStats);

    expect(await controller.getPlayerStats('123')).toEqual(mockStats);
    expect(jest.spyOn(service, 'getPlayerStats')).toHaveBeenCalledWith('123');
  });

  it('deve obter estatísticas de um deck', async () => {
    const mockStats = { deckId: 'Mono Red', total: 15, wins: 9, winRate: 60 };
    jest.spyOn(service, 'getDeckStats').mockResolvedValue(mockStats);

    expect(await controller.getDeckStats('Mono Red')).toEqual(mockStats);
    expect(jest.spyOn(service, 'getDeckStats')).toHaveBeenCalledWith(
      'Mono Red',
    );
  });

  it('deve obter histórico de confronto entre jogadores', async () => {
    const mockMatchup = {
      player1: 'player1',
      player2: 'player2',
      matches: [
        {
          player_id: 'uuid-player1',
          deck_id: 'uuid-deck1',
          format: 'modern',
          result: MatchResult.WIN, // 🔹 Corrigido para minúsculas, conforme `MatchResult`
          duration: 30,
          match_date: '2024-02-22T12:00:00Z',
        },
      ],
    };

    jest.spyOn(service, 'getMatchup').mockResolvedValue(mockMatchup);

    expect(await controller.getMatchup('player1', 'player2')).toEqual(
      mockMatchup,
    );
    expect(jest.spyOn(service, 'getMatchup')).toHaveBeenCalledWith(
      'player1',
      'player2',
    );
  });

  it('deve comparar o desempenho de dois decks', async () => {
    const mockComparison = {
      deck1: { deckId: 'Mono Red', total: 10, wins: 5, winRate: 50 },
      deck2: { deckId: 'Control', total: 8, wins: 6, winRate: 75 },
    };
    jest.spyOn(service, 'compareDecks').mockResolvedValue(mockComparison);

    expect(await controller.compareDecks('Mono Red', 'Control')).toEqual(
      mockComparison,
    );
    expect(jest.spyOn(service, 'compareDecks')).toHaveBeenCalledWith(
      'Mono Red',
      'Control',
    );
  });

  it('deve obter o ranking dos jogadores', async () => {
    const mockLeaderboard = [
      { player: 'Jogador1', winRate: 80 },
      { player: 'Jogador2', winRate: 75 },
    ];
    jest.spyOn(service, 'getLeaderboard').mockResolvedValue(mockLeaderboard);

    expect(await controller.getLeaderboard()).toEqual(mockLeaderboard);
    expect(jest.spyOn(service, 'getLeaderboard')).toHaveBeenCalledWith();
  });
});
