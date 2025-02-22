// src/external/scryfall.service.ts
import axios from 'axios';

export class ScryfallService {
  async getCardDetails(cardName: string) {
    try {
      const response = await axios.get(
        `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`,
      );
      return response.data as { [key: string]: any };
    } catch (error: any) {
      throw new Error(`Error fetching card: ${(error as Error).message}`);
    }
  }
}
