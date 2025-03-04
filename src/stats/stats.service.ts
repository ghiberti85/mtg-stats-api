import { Injectable } from '@nestjs/common';
import { MatchesService } from '../matches/matches.service';
import { MatchResult } from '../enums/match-result.enum';
import { PlayersService } from '../players/players.service';
import { PlayerDto } from '../players/entities/player.entity';

@Injectable()
export class StatsService {
  constructor(
    private readonly matchesService: MatchesService,
    private readonly playersService: PlayersService,
  ) {}

  async getPlayerStats(playerId: string) {
    const matches = await this.matchesService.getMatchesByPlayer(playerId);
    const wins = matches.filter((m) => m.result === MatchResult.WIN).length;
    const total = matches.length;
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    return { playerId, total, wins, winRate };
  }

  async getDeckStats(deckId: string) {
    const matches = await this.matchesService.getMatchesByDeck(deckId);
    const wins = matches.filter((m) => m.result === MatchResult.WIN).length;
    const total = matches.length;
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    return { deckId, total, wins, winRate };
  }

  async getMatchup(player1: string, player2: string) {
    const matches = await this.matchesService.getMatchupHistory(
      player1,
      player2,
    );
    return { player1, player2, matches };
  }

  async compareDecks(deck1: string, deck2: string) {
    const deck1Stats = await this.getDeckStats(deck1);
    const deck2Stats = await this.getDeckStats(deck2);
    return { deck1: deck1Stats, deck2: deck2Stats };
  }

  async getLeaderboard() {
    let players: { id: string; name: string }[] = [];

    try {
      // Converte o resultado para PlayerDto[]
      const playerDtos =
        (await this.playersService.getPlayers()) as PlayerDto[];
      if (!Array.isArray(playerDtos)) {
        console.error('Failed to fetch players');
        return [];
      }

      players = playerDtos
        .filter((player) => !!player.id && !!player.name)
        .map((player) => ({ id: player.id, name: player.name }));

      if (players.length === 0) {
        console.error('No valid players found');
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch players', error as Error);
      return [];
    }

    const leaderboard: { player: string; winRate: number }[] = [];

    for (const player of players) {
      const stats = await this.getPlayerStats(player.id);
      leaderboard.push({
        player: player.name,
        winRate: Math.round(stats.winRate * 100) / 100,
      });
    }

    return leaderboard.sort((a, b) => b.winRate - a.winRate);
  }
}
