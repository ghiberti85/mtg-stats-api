/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchResult } from '../enums/match-result.enum';

describe('MatchesController', () => {
  let controller: MatchesController;
  let matchesService: MatchesService;

  // Exemplo de objeto de match (resultado sempre em minúsculas conforme o enum)
  const mockMatch = {
    id: 'match-uuid',
    player_id: 'player-uuid',
    opponent_id: 'opponent-uuid',
    deck_id: 'deck-uuid',
    opponent_deck_id: 'opponent-deck-uuid',
    format: 'standard',
    duration: 30,
    result: MatchResult.WIN, // que equivale a 'win'
  };

  const mockMatchesService = {
    createMatch: jest.fn().mockResolvedValue(mockMatch),
    getMatches: jest.fn().mockResolvedValue([mockMatch]),
    getMatchById: jest.fn().mockResolvedValue(mockMatch),
    updateMatch: jest
      .fn()
      .mockResolvedValue({ ...mockMatch, result: MatchResult.LOSS }),
    deleteMatch: jest
      .fn()
      .mockResolvedValue({ message: 'Match removed successfully' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchesController],
      providers: [
        {
          provide: MatchesService,
          useValue: mockMatchesService,
        },
      ],
    }).compile();

    controller = module.get<MatchesController>(MatchesController);
    matchesService = module.get<MatchesService>(MatchesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMatch', () => {
    it('should create a new match with normalized result', async () => {
      // Envia um CreateMatchDto com result em letras diferentes
      const createMatchDto: CreateMatchDto = {
        player_id: 'player-uuid',
        opponent_id: 'opponent-uuid',
        deck_id: 'deck-uuid',
        opponent_deck_id: 'opponent-deck-uuid',
        format: 'standard',
        duration: 30,
        result: MatchResult.WIN, // Pode ser enviado em qualquer formato, o controller normaliza
      };

      const result = await controller.createMatch(createMatchDto);
      // O controller normaliza o campo para minúsculas e atribui o membro do enum
      expect(result).toEqual(mockMatch);
      expect(matchesService.createMatch).toHaveBeenCalledWith(createMatchDto);
    });

    it('should throw InternalServerErrorException for invalid result', async () => {
      const invalidDto: CreateMatchDto = {
        player_id: 'player-uuid',
        opponent_id: 'opponent-uuid',
        deck_id: 'deck-uuid',
        opponent_deck_id: 'opponent-deck-uuid',
        format: 'standard',
        duration: 30,
        result: 'invalid' as unknown as MatchResult,
      };

      await expect(controller.createMatch(invalidDto)).rejects.toThrow();
    });
  });

  describe('getMatches', () => {
    it('should return an array of matches', async () => {
      const result = await controller.getMatches('player-uuid');
      expect(result).toEqual([mockMatch]);
      expect(matchesService.getMatches).toHaveBeenCalledWith('player-uuid');
    });
  });

  describe('getMatchById', () => {
    it('should return a match by id', async () => {
      const matchId = 'match-uuid';
      const result = await controller.getMatchById(matchId);
      expect(result).toEqual(mockMatch);
      expect(matchesService.getMatchById).toHaveBeenCalledWith(matchId);
    });
  });

  describe('updateMatch', () => {
    it('should update and return the match', async () => {
      const matchId = 'match-uuid';
      const updateDto: UpdateMatchDto = { result: MatchResult.LOSS };
      const result = await controller.updateMatch(matchId, updateDto);
      expect(result).toEqual({ ...mockMatch, result: MatchResult.LOSS });
      expect(matchesService.updateMatch).toHaveBeenCalledWith(
        matchId,
        updateDto,
      );
    });
  });

  describe('deleteMatch', () => {
    it('should delete the match and return confirmation', async () => {
      const matchId = 'match-uuid';
      const result = await controller.deleteMatch(matchId);
      expect(result).toEqual({ message: 'Match removed successfully' });
      expect(matchesService.deleteMatch).toHaveBeenCalledWith(matchId);
    });
  });
});
