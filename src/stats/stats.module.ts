import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { MatchesService } from '../matches/matches.service';
import { PlayersService } from '../players/players.service';
import { DecksService } from '../decks/decks.service';

@Module({
  imports: [],
  controllers: [StatsController],
  providers: [StatsService, MatchesService, PlayersService, DecksService],
})
export class StatsModule {}
