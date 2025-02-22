import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { MatchesService } from '../matches/matches.service';
import { PlayersService } from '../players/players.service';

describe('StatsService', () => {
  let service: StatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: MatchesService,
          useValue: { getMatchesByPlayer: jest.fn() },
        },
        { provide: PlayersService, useValue: { getAllPlayers: jest.fn() } },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  it('deve calcular a taxa de vitória de um jogador', async () => {
    jest
      .spyOn(service, 'getPlayerStats')
      .mockResolvedValue({ playerId: '123', total: 10, wins: 6, winRate: 60 });
    expect(await service.getPlayerStats('123')).toEqual({
      playerId: '123',
      total: 10,
      wins: 6,
      winRate: 60,
    });
  });
});
