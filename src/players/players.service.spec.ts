/* eslint-disable @typescript-eslint/unbound-method */
// src/players/players.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { PlayersService } from './players.service';
import { supabase } from '../supabaseClient';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

jest.mock('../supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('PlayersService', () => {
  let service: PlayersService;

  // Objeto para criação (CreatePlayerDto)
  const mockCreatePlayer: CreatePlayerDto = {
    name: 'Test Player',
    email: 'test@example.com',
    level: 1,
  };

  // Objeto retornado pelo DB após a inserção (inclui o id gerado)
  const mockPlayerFromDB = {
    id: 'player-123',
    name: 'Test Player',
    email: 'test@example.com',
    level: 1,
  };

  // Objeto para update (UpdatePlayerDto) – conforme o DTO, apenas "name" é permitido
  const mockUpdatePlayer: UpdatePlayerDto = {
    name: 'Updated Player',
  };

  // Objeto retornado pelo DB após o update
  const mockUpdatedPlayerFromDB = {
    id: 'player-123',
    name: 'Updated Player',
    email: 'test@example.com',
    level: 1,
  };

  const mockMatches = [
    {
      player_id: 'player-123',
      deck_id: 'deck-abc',
      format: 'Standard',
      result: 'WIN',
      duration: 45,
      match_date: '2025-02-26T10:00:00',
    },
    {
      player_id: 'player-123',
      deck_id: 'deck-xyz',
      format: 'Commander',
      result: 'LOSS',
      duration: 60,
      match_date: '2025-02-27T10:00:00',
    },
    {
      player_id: 'player-123',
      deck_id: 'deck-abc',
      format: 'Modern',
      result: 'WIN',
      duration: 30,
      match_date: '2025-02-28T10:00:00',
    },
  ];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayersService],
    }).compile();

    service = module.get<PlayersService>(PlayersService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPlayer', () => {
    it('deve criar um jogador com sucesso', async () => {
      // Simula: supabase.from('players').insert([mockCreatePlayer]).select()
      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockResolvedValueOnce({
            data: [mockPlayerFromDB],
            error: null,
          }),
        }),
      });

      const result = await service.createPlayer(mockCreatePlayer);
      expect(result).toEqual(mockPlayerFromDB);
      expect(supabase.from).toHaveBeenCalledWith('players');
    });

    it('deve lançar InternalServerErrorException se o supabase retornar erro', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockResolvedValueOnce({
            data: null,
            error: { message: 'Erro ao inserir jogador' },
          }),
        }),
      });

      await expect(service.createPlayer(mockCreatePlayer)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('deve lançar InternalServerErrorException se não retornar dados', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockResolvedValueOnce({
            data: [],
            error: null,
          }),
        }),
      });

      await expect(service.createPlayer(mockCreatePlayer)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getPlayerById', () => {
    it('deve retornar o jogador se encontrado', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            maybeSingle: jest.fn().mockResolvedValueOnce({
              data: mockPlayerFromDB,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getPlayerById('player-123');
      expect(result).toEqual(mockPlayerFromDB);
      expect(supabase.from).toHaveBeenCalledWith('players');
    });

    it('deve lançar NotFoundException se não encontrar o jogador', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            maybeSingle: jest.fn().mockResolvedValueOnce({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      await expect(service.getPlayerById('player-not-found')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar NotFoundException se ocorrer um erro no supabase', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            maybeSingle: jest.fn().mockResolvedValueOnce({
              data: null,
              error: { message: 'Erro ao buscar jogador' },
            }),
          }),
        }),
      });

      await expect(service.getPlayerById('player-error')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPlayers', () => {
    it('deve retornar uma lista de jogadores', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce({
          data: [mockPlayerFromDB],
          error: null,
        }),
      });

      const result = await service.getPlayers();
      expect(result).toEqual([mockPlayerFromDB]);
      expect(supabase.from).toHaveBeenCalledWith('players');
    });

    it('deve retornar array vazio se não houver jogadores', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce({
          data: null,
          error: null,
        }),
      });

      const result = await service.getPlayers();
      expect(result).toEqual([]);
    });

    it('deve lançar InternalServerErrorException em caso de erro', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce({
          data: null,
          error: { message: 'Erro ao listar jogadores' },
        }),
      });

      await expect(service.getPlayers()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getPlayerStats', () => {
    it('deve retornar estatísticas do jogador se houver partidas', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({
            data: mockMatches,
            error: null,
          }),
        }),
      });

      const stats = await service.getPlayerStats('player-123');
      expect(stats.playerId).toBe('player-123');
      expect(stats.totalMatches).toBe(3);
      expect(stats.wins).toBe(2);
      expect(stats.losses).toBe(1);
      expect(stats.winRate).toBe(Math.round((2 / 3) * 100));
      expect(stats.bestDeck).toBe('deck-abc');
      expect(stats.performanceHistory).toHaveLength(3);
    });

    it('deve lançar NotFoundException se não houver partidas', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({
            data: [],
            error: null,
          }),
        }),
      });

      await expect(service.getPlayerStats('player-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar NotFoundException em caso de erro no supabase', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({
            data: null,
            error: { message: 'Erro ao buscar partidas' },
          }),
        }),
      });

      await expect(service.getPlayerStats('player-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePlayer', () => {
    it('deve atualizar o jogador com sucesso', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            select: jest.fn().mockReturnValueOnce({
              maybeSingle: jest.fn().mockResolvedValueOnce({
                data: mockUpdatedPlayerFromDB,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.updatePlayer('player-123', mockUpdatePlayer);
      expect(result).toEqual(mockUpdatedPlayerFromDB);
      expect(supabase.from).toHaveBeenCalledWith('players');
    });

    it('deve lançar NotFoundException se não encontrar o jogador para atualizar', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            select: jest.fn().mockReturnValueOnce({
              maybeSingle: jest.fn().mockResolvedValueOnce({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      });

      await expect(
        service.updatePlayer('player-not-found', mockUpdatePlayer),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException em caso de erro no supabase', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            select: jest.fn().mockReturnValueOnce({
              maybeSingle: jest.fn().mockResolvedValueOnce({
                data: null,
                error: { message: 'Erro ao atualizar jogador' },
              }),
            }),
          }),
        }),
      });

      await expect(
        service.updatePlayer('player-error', mockUpdatePlayer),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePlayer', () => {
    it('deve deletar o jogador com sucesso', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        delete: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            select: jest.fn().mockReturnValueOnce({
              maybeSingle: jest.fn().mockResolvedValueOnce({
                data: { id: 'player-123' },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.deletePlayer('player-123');
      expect(result).toEqual({ message: 'Player deleted successfully' });
      expect(supabase.from).toHaveBeenCalledWith('players');
    });

    it('deve lançar NotFoundException se não encontrar o jogador para deletar', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        delete: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            select: jest.fn().mockReturnValueOnce({
              maybeSingle: jest.fn().mockResolvedValueOnce({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      });

      await expect(service.deletePlayer('player-not-found')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar NotFoundException em caso de erro no supabase', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        delete: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            select: jest.fn().mockReturnValueOnce({
              maybeSingle: jest.fn().mockResolvedValueOnce({
                data: null,
                error: { message: 'Erro ao deletar jogador' },
              }),
            }),
          }),
        }),
      });

      await expect(service.deletePlayer('player-error')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
