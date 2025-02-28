import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { supabase } from '../supabaseClient';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';

export interface Deck {
  id: string;
  name: string;
  player_id: string;
  archetype: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable()
export class DecksService {
  async createDeck(createDeckDto: CreateDeckDto): Promise<Deck> {
    const response = await supabase
      .from('decks')
      .insert([createDeckDto])
      .select('*');

    if (response.error || !response.data || response.data.length === 0) {
      throw new InternalServerErrorException(
        `Error creating deck: ${response.error?.message || 'Unknown error'}`,
      );
    }

    return response.data[0] as Deck;
  }

  async getDeckById(deckId: string): Promise<Deck> {
    const response = await supabase
      .from('decks')
      .select('*')
      .eq('id', deckId)
      .single();

    if (response.error || !response.data) {
      throw new NotFoundException(`Deck with id ${deckId} not found.`);
    }

    return response.data as Deck;
  }

  async getDecks(): Promise<Deck[]> {
    const response = await supabase.from('decks').select('*');

    if (response.error || !response.data) {
      throw new InternalServerErrorException('Error retrieving decks.');
    }

    return response.data as Deck[];
  }

  async updateDeck(
    deckId: string,
    updateDeckDto: UpdateDeckDto,
  ): Promise<Deck> {
    const response = await supabase
      .from('decks')
      .update(updateDeckDto)
      .eq('id', deckId)
      .select('*')
      .single();

    if (response.error || !response.data) {
      throw new NotFoundException(
        `Deck with id ${deckId} not found or update failed.`,
      );
    }

    return response.data as Deck;
  }

  async deleteDeck(deckId: string): Promise<void> {
    const response = await supabase
      .from('decks')
      .delete()
      .eq('id', deckId)
      .select('*');

    if (response.error) {
      throw new NotFoundException(
        `Deck with id ${deckId} not found or deletion failed: ${response.error.message}`,
      );
    }
  }
}
