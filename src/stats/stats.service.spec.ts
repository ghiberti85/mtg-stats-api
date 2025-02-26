import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { MatchesService } from '../matches/matches.service';
import { PlayersService } from '../players/players.service';
import { MatchResult } from '../enums/match-result.enum';
import { CreatePlayerDto } from 'src/players/dto/create-player.dto';

describe('StatsService', () => {
  let service: StatsService;
  let matchesService: MatchesService;
  let playersService: PlayersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: MatchesService,
          useValue: {
            getMatchesByPlayer: jest.fn(),
            getMatchesByDeck: jest.fn(),
            getAllPlayers: jest.fn(),
            getMatchupHistory: jest.fn(),
          },
        },
        {
          provide: PlayersService,
          useValue: {
            getAllPlayers: jest.fn(() => Promise.resolve([])),
            getPlayers: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
    matchesService = module.get<MatchesService>(MatchesService);
    playersService = module.get<PlayersService>(PlayersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ✅ Test: Calculate player win rate
  it('should calculate player win rate', async () => {
    jest.spyOn(matchesService, 'getMatchesByPlayer').mockResolvedValue([
      {
        player_id: 'player1',
        deck_id: 'deck1',
        format: 'Modern',
        result: MatchResult.WIN,
        duration: 30,
        match_date: '2024-02-22T12:00:00Z',
      },
      {
        player_id: 'player1',
        deck_id: 'deck1',
        format: 'Modern',
        result: MatchResult.LOSS,
        duration: 25,
        match_date: '2024-02-23T15:45:00Z',
      },
    ]);

    const stats = await service.getPlayerStats('player1');

    expect(stats).toEqual({
      playerId: 'player1',
      total: 2,
      wins: 1,
      winRate: 50,
    });
  });

  // ✅ Test: Calculate deck win rate
  it('should calculate deck win rate', async () => {
    jest.spyOn(matchesService, 'getMatchesByDeck').mockResolvedValue([
      {
        player_id: 'player1',
        deck_id: 'deck1',
        format: 'Modern',
        result: MatchResult.WIN,
        duration: 30,
        match_date: '2024-02-22T12:00:00Z',
      },
      {
        player_id: 'player2',
        deck_id: 'deck1',
        format: 'Modern',
        result: MatchResult.LOSS,
        duration: 25,
        match_date: '2024-02-23T14:00:00Z',
      },
    ]);

    const stats = await service.getDeckStats('deck1');

    expect(stats).toEqual({
      deckId: 'deck1',
      total: 2,
      wins: 1,
      winRate: 50,
    });
  });

  // ✅ Test: Get matchup history
  it('should retrieve matchup history between two players', async () => {
    jest.spyOn(matchesService, 'getMatchupHistory').mockResolvedValue([
      {
        player_id: 'player1',
        deck_id: 'deck1',
        opponent_id: 'player2',
        result: MatchResult.WIN,
        format: 'Modern',
        duration: 30,
      },
      {
        player_id: 'player2',
        deck_id: 'deck2',
        opponent_id: 'player1',
        result: MatchResult.LOSS,
        format: 'Modern',
        duration: 25,
      },
    ]);

    const matchup = await service.getMatchup('player1', 'player2');

    expect(matchup).toEqual({
      player1: 'player1',
      player2: 'player2',
      matches: [
        {
          player_id: 'player1',
          deck_id: 'deck1',
          opponent_id: 'player2',
          result: MatchResult.WIN,
          format: 'Modern',
          duration: 30,
        },
        {
          player_id: 'player2',
          deck_id: 'deck2',
          opponent_id: 'player1',
          result: MatchResult.LOSS,
          format: 'Modern',
          duration: 25,
        },
      ],
    });
  });

  // ✅ Test: Compare deck performance
  it('should compare two decks correctly', async () => {
    jest
      .spyOn(matchesService, 'getMatchesByDeck')
      .mockImplementation((deckId) =>
        Promise.resolve(
          deckId === 'deck1'
            ? [
                {
                  player_id: 'player1',
                  deck_id: 'deck1',
                  format: 'Modern',
                  result: MatchResult.WIN,
                  duration: 30,
                  match_date: '2024-02-22T12:00:00Z',
                },
                {
                  player_id: 'player2',
                  deck_id: 'deck1',
                  format: 'Modern',
                  result: MatchResult.LOSS,
                  duration: 25,
                  match_date: '2024-02-23T14:00:00Z',
                },
              ]
            : [
                {
                  player_id: 'player3',
                  deck_id: 'deck2',
                  format: 'Legacy',
                  result: MatchResult.WIN,
                  duration: 40,
                  match_date: '2024-02-25T17:30:00Z',
                },
                {
                  player_id: 'player4',
                  deck_id: 'deck2',
                  format: 'Legacy',
                  result: MatchResult.LOSS,
                  duration: 35,
                  match_date: '2024-02-26T20:00:00Z',
                },
              ],
        ),
      );

    const comparison = await service.compareDecks('deck1', 'deck2');

    expect(comparison).toEqual({
      deck1: { deckId: 'deck1', total: 2, wins: 1, winRate: 50 }, // 🔹 Ajustado para 2 partidas e 50% win rate
      deck2: { deckId: 'deck2', total: 2, wins: 1, winRate: 50 }, // 🔹 Ajustado para 2 partidas e 50% win rate
    });
  });

  // ✅ Test: Return player leaderboard
  it('should return the player leaderboard correctly', async () => {
    jest.spyOn(playersService, 'getPlayers').mockResolvedValue([
      { name: 'Player One', email: 'playerone@example.com' },
      { name: 'Player Two', email: 'playertwo@example.com' },
    ] as CreatePlayerDto[]);

    jest
      .spyOn(matchesService, 'getMatchesByPlayer')
      .mockImplementation((playerName) =>
        Promise.resolve(
          playerName === 'Player One'
            ? [
                {
                  player_id: 'player1',
                  result: MatchResult.WIN,
                  deck_id: 'deck1',
                  format: 'Modern',
                  duration: 30,
                },
                {
                  player_id: 'player1',
                  result: MatchResult.WIN,
                  deck_id: 'deck2',
                  format: 'Pioneer',
                  duration: 40,
                },
                {
                  player_id: 'player1',
                  result: MatchResult.LOSS,
                  deck_id: 'deck1',
                  format: 'Modern',
                  duration: 20,
                },
              ]
            : [
                {
                  player_id: 'player2',
                  result: MatchResult.WIN,
                  deck_id: 'deck3',
                  format: 'Legacy',
                  duration: 35,
                },
                {
                  player_id: 'player2',
                  result: MatchResult.LOSS,
                  deck_id: 'deck4',
                  format: 'Standard',
                  duration: 25,
                },
              ],
        ),
      );

    const leaderboard = await service.getLeaderboard();

    expect(leaderboard).toEqual([
      { player: 'Player One', winRate: 66.67 },
      { player: 'Player Two', winRate: 50 },
    ]);
  });
});
