/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

describe('PlayersController', () => {
  let controller: PlayersController;
  let playersService: PlayersService;

  const mockPlayer = {
    id: 'player-uuid',
    name: 'John Doe',
    email: 'john@example.com',
    level: 1,
  };

  const mockPlayerStats = {
    playerId: 'player-uuid',
    totalMatches: 10,
    wins: 6,
    losses: 4,
    winRate: 60,
    bestDeck: 'deck-uuid',
    performanceHistory: [],
  };

  const mockPlayersService = {
    createPlayer: jest.fn().mockResolvedValue(mockPlayer),
    getPlayers: jest.fn().mockResolvedValue([mockPlayer]),
    getPlayerById: jest.fn().mockResolvedValue(mockPlayer),
    getPlayerStats: jest.fn().mockResolvedValue(mockPlayerStats),
    updatePlayer: jest
      .fn()
      .mockResolvedValue({ ...mockPlayer, name: 'John Updated' }),
    deletePlayer: jest
      .fn()
      .mockResolvedValue({ message: 'Player successfully removed' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayersController],
      providers: [
        {
          provide: PlayersService,
          useValue: mockPlayersService,
        },
      ],
    }).compile();

    controller = module.get<PlayersController>(PlayersController);
    playersService = module.get<PlayersService>(PlayersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPlayer', () => {
    it('should create a new player', async () => {
      const createPlayerDto: CreatePlayerDto = {
        name: 'John Doe',
        email: 'john@example.com',
        level: 1,
      };
      const result: CreatePlayerDto =
        await controller.createPlayer(createPlayerDto);
      expect(result).toEqual(mockPlayer);
      expect(playersService.createPlayer).toHaveBeenCalledWith(createPlayerDto);
    });
  });

  describe('getAllPlayers', () => {
    it('should return an array of players', async () => {
      const result = await controller.getAllPlayers();
      expect(result).toEqual([mockPlayer]);
      expect(playersService.getPlayers).toHaveBeenCalled();
    });
  });

  describe('getPlayerById', () => {
    it('should return a player by id', async () => {
      const playerId = 'player-uuid';
      const result = await controller.getPlayerById(playerId);
      expect(result).toEqual(mockPlayer);
      expect(playersService.getPlayerById).toHaveBeenCalledWith(playerId);
    });
  });

  describe('getPlayerStats', () => {
    it('should return player statistics', async () => {
      const playerId = 'player-uuid';
      const stats = await controller.getPlayerStats(playerId);
      expect(stats).toEqual(mockPlayerStats);
      expect(playersService.getPlayerStats).toHaveBeenCalledWith(playerId);
    });
  });

  describe('updatePlayer', () => {
    it('should update and return the updated player', async () => {
      const playerId = 'player-uuid';
      const updatePlayerDto: UpdatePlayerDto = { name: 'John Updated' };
      const result = await controller.updatePlayer(playerId, updatePlayerDto);
      expect(result).toEqual({ ...mockPlayer, name: 'John Updated' });
      expect(playersService.updatePlayer).toHaveBeenCalledWith(
        playerId,
        updatePlayerDto,
      );
    });
  });

  describe('deletePlayer', () => {
    it('should remove the player', async () => {
      const playerId = 'player-uuid';
      const result = await controller.deletePlayer(playerId);
      expect(result).toEqual({ message: 'Player successfully removed' });
      expect(playersService.deletePlayer).toHaveBeenCalledWith(playerId);
    });
  });
});
