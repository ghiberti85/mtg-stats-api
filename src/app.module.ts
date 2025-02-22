// src/app.module.ts
import { Module } from '@nestjs/common';
import { MatchesModule } from './matches/matches.module';
import { PlayersModule } from './players/players.module';
import { DecksModule } from './decks/decks.module';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MatchesModule,
    PlayersModule,
    DecksModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
