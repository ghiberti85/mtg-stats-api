import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { MatchesService } from '../matches/matches.service';
import { PlayersService } from '../players/players.service';
import { MatchResult } from '../enums/match-result.enum';

describe('StatsService', () => {
  let service: StatsService;
  let matchesService: MatchesService;

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
            // Aqui garantimos que getPlayers retorne jogadores com id e name
            getPlayers: jest.fn(() =>
              Promise.resolve([
                {
                  id: 'player1',
                  name: 'Player One',
                  email: 'playerone@example.com',
                },
                {
                  id: 'player2',
                  name: 'Player Two',
                  email: 'playertwo@example.com',
                },
              ]),
            ),
            getAllPlayers: jest.fn(() => Promise.resolve([])),
          },
        },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
    matchesService = module.get<MatchesService>(MatchesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test: Calculate player win rate
  it('should calculate player win rate', async () => {
    jest.spyOn(matchesService, 'getMatchesByPlayer').mockResolvedValue([
      {
        id: 'match1',
        player_id: 'player1',
        deck_id: 'deck1',
        format: 'Modern',
        result: MatchResult.WIN,
        duration: 30,
      },
      {
        id: 'match2',
        player_id: 'player1',
        deck_id: 'deck1',
        format: 'Modern',
        result: MatchResult.LOSS,
        duration: 25,
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

  // Test: Calculate deck win rate
  it('should calculate deck win rate', async () => {
    jest.spyOn(matchesService, 'getMatchesByDeck').mockResolvedValue([
      {
        id: 'match3',
        player_id: 'player1',
        deck_id: 'deck1',
        format: 'Modern',
        result: MatchResult.WIN,
        duration: 30,
      },
      {
        id: 'match4',
        player_id: 'player2',
        deck_id: 'deck1',
        format: 'Modern',
        result: MatchResult.LOSS,
        duration: 25,
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

  // Test: Get matchup history
  it('should retrieve matchup history between two players', async () => {
    jest.spyOn(matchesService, 'getMatchupHistory').mockResolvedValue([
      {
        id: 'match5',
        player_id: 'player1',
        deck_id: 'deck1',
        opponent_id: 'player2',
        result: MatchResult.WIN,
        format: 'Modern',
        duration: 30,
      },
      {
        id: 'match6',
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
          id: 'match5',
          player_id: 'player1',
          deck_id: 'deck1',
          opponent_id: 'player2',
          result: MatchResult.WIN,
          format: 'Modern',
          duration: 30,
        },
        {
          id: 'match6',
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

  // Test: Compare deck performance
  it('should compare two decks correctly', async () => {
    jest
      .spyOn(matchesService, 'getMatchesByDeck')
      .mockImplementation((deckId) =>
        Promise.resolve(
          deckId === 'deck1'
            ? [
                {
                  id: 'match7',
                  player_id: 'player1',
                  deck_id: 'deck1',
                  format: 'Modern',
                  result: MatchResult.WIN,
                  duration: 30,
                },
                {
                  id: 'match8',
                  player_id: 'player2',
                  deck_id: 'deck1',
                  format: 'Modern',
                  result: MatchResult.LOSS,
                  duration: 25,
                },
              ]
            : [
                {
                  id: 'match9',
                  player_id: 'player3',
                  deck_id: 'deck2',
                  format: 'Legacy',
                  result: MatchResult.WIN,
                  duration: 40,
                },
                {
                  id: 'match10',
                  player_id: 'player4',
                  deck_id: 'deck2',
                  format: 'Legacy',
                  result: MatchResult.LOSS,
                  duration: 35,
                },
              ],
        ),
      );

    const comparison = await service.compareDecks('deck1', 'deck2');

    expect(comparison).toEqual({
      deck1: { deckId: 'deck1', total: 2, wins: 1, winRate: 50 },
      deck2: { deckId: 'deck2', total: 2, wins: 1, winRate: 50 },
    });
  });

  // Test: Return player leaderboard
  it('should return the player leaderboard correctly', async () => {
    jest
      .spyOn(matchesService, 'getMatchesByPlayer')
      .mockImplementation((playerId) =>
        Promise.resolve(
          playerId === 'player1'
            ? [
                {
                  id: 'm12',
                  player_id: 'player1',
                  result: MatchResult.WIN,
                  deck_id: 'deck1',
                  format: 'Modern',
                  duration: 30,
                },
                {
                  id: 'm13',
                  player_id: 'player1',
                  result: MatchResult.WIN,
                  deck_id: 'deck2',
                  format: 'Pioneer',
                  duration: 40,
                },
                {
                  id: 'm14',
                  player_id: 'player1',
                  result: MatchResult.LOSS,
                  deck_id: 'deck1',
                  format: 'Modern',
                  duration: 20,
                },
              ]
            : [
                {
                  id: 'm15',
                  player_id: 'player2',
                  result: MatchResult.WIN,
                  deck_id: 'deck3',
                  format: 'Legacy',
                  duration: 35,
                },
                {
                  id: 'm16',
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
