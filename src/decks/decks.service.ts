// src/decks/decks.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { supabase } from '../supabaseClient';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';

@Injectable()
export class DecksService {
  async createDeck(createDeckDto: CreateDeckDto): Promise<CreateDeckDto> {
    const {
      data,
      error,
    }: { data: CreateDeckDto[] | null; error: { message: string } | null } =
      await supabase.from('decks').insert([createDeckDto]).select();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!data || data.length === 0) {
      throw new InternalServerErrorException('No data returned from Supabase.');
    }
    return data[0];
  }

  async getDeckById(deckId: string) {
    const {
      data,
      error,
    }: { data: Record<string, any> | null; error: { message: string } | null } =
      await supabase.from('decks').select('*').eq('id', deckId).single();

    if (error || !data) {
      throw new NotFoundException(`Deck with id ${deckId} not found.`);
    }
    return data;
  }

  async getDecks(playerId?: string): Promise<Record<string, any>[]> {
    let query = supabase.from('decks').select('*');
    if (playerId) {
      query = query.eq('player_id', playerId);
    }
    const {
      data,
      error,
    }: { data: any[] | null; error: { message: string } | null } = await query;
    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return (data as Record<string, any>[]) ?? [];
  }

  async updateDeck(deckId: string, updateDeckDto: UpdateDeckDto) {
    const {
      data,
      error,
    }: { data: any[] | null; error: { message: string } | null } =
      await supabase
        .from('decks')
        .update(updateDeckDto)
        .eq('id', deckId)
        .select();
    if (error) {
      throw new NotFoundException(
        `Deck with id ${deckId} not found or update failed: ${error.message}`,
      );
    }
    if (!data || data.length === 0) {
      throw new NotFoundException(
        `Deck with id ${deckId} not found or update failed.`,
      );
    }
    return data[0] as UpdateDeckDto;
  }

  async deleteDeck(deckId: string) {
    const {
      data,
      error,
    }: { data: any[] | null; error: { message: string } | null } =
      await supabase.from('decks').delete().eq('id', deckId).select();
    if (error) {
      throw new NotFoundException(
        `Deck with id ${deckId} not found or deletion failed: ${error.message}`,
      );
    }
    if (!data || data.length === 0) {
      throw new NotFoundException(
        `Deck with id ${deckId} not found or deletion failed.`,
      );
    }
    return { message: 'Deck deleted successfully' };
  }
}
