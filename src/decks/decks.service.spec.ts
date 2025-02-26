import { Test, TestingModule } from '@nestjs/testing';
import { DecksService } from './decks.service';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { supabase } from '../supabaseClient';

jest.mock('../supabaseClient');

describe('DecksService', () => {
  let service: DecksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DecksService],
    }).compile();

    service = module.get<DecksService>(DecksService);
  });

  it('should create a deck successfully', async () => {
    const createDeckDto = { id: '123', name: 'Deck1', archetype: 'modern' };
    (supabase.from as jest.Mock).mockReturnValueOnce({
      insert: jest.fn().mockReturnValueOnce({
        select: jest
          .fn()
          .mockResolvedValueOnce({ data: [createDeckDto], error: null }),
      }),
    });

    const result = await service.createDeck(createDeckDto);
    expect(result).toEqual(createDeckDto);
  });

  it('should throw an error when creation fails', async () => {
    const createDeckDto = { id: '123', name: 'Deck1', archetype: 'modern' };
    (supabase.from as jest.Mock).mockReturnValueOnce({
      insert: jest.fn().mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce({
          data: null,
          error: { message: 'Creation failed' },
        }),
      }),
    });

    await expect(service.createDeck(createDeckDto)).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('should retrieve a deck by ID', async () => {
    const mockDeck = { id: 'deck1', name: 'Deck1', archetype: 'modern' };
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValueOnce({ data: mockDeck, error: null }),
      }),
    });

    const result = await service.getDeckById('deck1');
    expect(result).toEqual(mockDeck);
  });

  it('should throw an error when retrieving a non-existent deck', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({
          data: null,
          error: { message: 'Not found' },
        }),
      }),
    });

    await expect(service.getDeckById('deck1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should retrieve a list of decks', async () => {
    const mockDecks = [
      { id: 'deck1', name: 'Deck1', archetype: 'modern' },
      { id: 'deck2', name: 'Deck2', archetype: 'legacy' },
    ];
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce({ data: mockDecks, error: null }),
    });

    const result = await service.getDecks();
    expect(result).toEqual(mockDecks);
  });

  it('should update a deck successfully', async () => {
    const updateDeckDto = { name: 'Updated Deck' };
    const mockDeck = { id: 'deck1', ...updateDeckDto, archetype: 'modern' };

    (supabase.from as jest.Mock).mockReturnValueOnce({
      update: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValueOnce({ data: mockDeck, error: null }),
      }),
    });

    const result = await service.updateDeck('deck1', updateDeckDto);
    expect(result).toEqual(mockDeck);
  });

  it('should delete a deck successfully', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      delete: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValueOnce({ data: null, error: null }),
      }),
    });

    await expect(service.deleteDeck('deck1')).resolves.not.toThrow();
  });

  it('should throw an error when deleting a non-existent deck', async () => {
    (supabase.from as jest.Mock).mockReturnValueOnce({
      delete: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnThis(),
        select: jest
          .fn()
          .mockResolvedValueOnce({ error: { message: 'Delete failed' } }),
      }),
    });

    await expect(service.deleteDeck('deck1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
