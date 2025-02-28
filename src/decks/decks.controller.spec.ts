/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { DecksController } from './decks.controller';
import { DecksService } from './decks.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';

describe('DecksController', () => {
  let controller: DecksController;
  let decksService: DecksService;

  const mockDeck = {
    id: 'deck-uuid',
    player_id: 'player-uuid',
    name: 'Deck One',
    archetype: 'Aggro',
  };

  const mockDecksService = {
    createDeck: jest.fn().mockResolvedValue(mockDeck),
    getDecks: jest.fn().mockResolvedValue([mockDeck]),
    getDeckById: jest.fn().mockResolvedValue(mockDeck),
    updateDeck: jest
      .fn()
      .mockResolvedValue({ ...mockDeck, name: 'Deck Updated' }),
    deleteDeck: jest
      .fn()
      .mockResolvedValue({ message: 'Deck successfully removed' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DecksController],
      providers: [
        {
          provide: DecksService,
          useValue: mockDecksService,
        },
      ],
    }).compile();

    controller = module.get<DecksController>(DecksController);
    decksService = module.get<DecksService>(DecksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createDeck', () => {
    it('should create a new deck', async () => {
      const createDeckDto: CreateDeckDto = {
        player_id: 'player-uuid',
        name: 'Deck One',
        archetype: 'Aggro',
      };
      const result = await controller.createDeck(createDeckDto);
      expect(result).toEqual(mockDeck);
      expect(decksService.createDeck).toHaveBeenCalledWith(createDeckDto);
    });
  });

  describe('getAllDecks', () => {
    it('should return an array of decks', async () => {
      const result = await controller.getAllDecks();
      expect(result).toEqual([mockDeck]);
      expect(decksService.getDecks).toHaveBeenCalled();
    });
  });

  describe('getDeckById', () => {
    it('should return a deck by id', async () => {
      const deckId = 'deck-uuid';
      const result = await controller.getDeckById(deckId);
      expect(result).toEqual(mockDeck);
      expect(decksService.getDeckById).toHaveBeenCalledWith(deckId);
    });
  });

  describe('updateDeck', () => {
    it('should update and return the deck', async () => {
      const deckId = 'deck-uuid';
      const updateDeckDto: UpdateDeckDto = { name: 'Deck Updated' };
      const result = await controller.updateDeck(deckId, updateDeckDto);
      expect(result).toEqual({ ...mockDeck, name: 'Deck Updated' });
      expect(decksService.updateDeck).toHaveBeenCalledWith(
        deckId,
        updateDeckDto,
      );
    });
  });

  describe('deleteDeck', () => {
    it('should remove the deck', async () => {
      const deckId = 'deck-uuid';
      const result = await controller.deleteDeck(deckId);
      expect(result).toEqual({ message: 'Deck successfully removed' });
      expect(decksService.deleteDeck).toHaveBeenCalledWith(deckId);
    });
  });
});
