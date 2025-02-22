import { Controller, Get, Param } from '@nestjs/common';
import { StatsService } from './stats.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Statistics') // 🔹 Category in Swagger
@ApiBearerAuth() // 🔹 Requires Bearer Token Authentication
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('player/:id')
  @ApiOperation({ summary: 'Get player statistics' })
  @ApiResponse({
    status: 200,
    description: 'Player statistics successfully returned',
  })
  @ApiResponse({ status: 404, description: 'Player not found' })
  async getPlayerStats(@Param('id') playerId: string) {
    return this.statsService.getPlayerStats(playerId);
  }

  @Get('deck/:id')
  @ApiOperation({ summary: 'Get deck statistics' })
  @ApiResponse({
    status: 200,
    description: 'Deck statistics successfully returned',
  })
  @ApiResponse({ status: 404, description: 'Deck not found' })
  async getDeckStats(@Param('id') deckId: string) {
    return this.statsService.getDeckStats(deckId);
  }

  @Get('matchup/:player1/:player2')
  @ApiOperation({ summary: 'Get matchup history between two players' })
  @ApiResponse({
    status: 200,
    description: 'Matchup history successfully returned',
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async getMatchup(
    @Param('player1') player1: string,
    @Param('player2') player2: string,
  ) {
    return this.statsService.getMatchup(player1, player2);
  }

  @Get('decks/:deck1/:deck2')
  @ApiOperation({ summary: 'Compare the performance of two decks' })
  @ApiResponse({
    status: 200,
    description: 'Deck comparison successfully returned',
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  async compareDecks(
    @Param('deck1') deck1: string,
    @Param('deck2') deck2: string,
  ) {
    return this.statsService.compareDecks(deck1, deck2);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get player leaderboard' })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard successfully returned',
  })
  async getLeaderboard() {
    return this.statsService.getLeaderboard();
  }
}
