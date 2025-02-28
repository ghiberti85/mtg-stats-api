// test/stats.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request, { Response } from 'supertest';
import { AppModule } from '../src/app.module';

describe('StatsController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let playerId: string;
  let deckId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    // Crie um usuário e obtenha o token
    const testEmail = `statstester${Date.now()}@example.com`;
    const testPassword = 'password123';
    const authRes: Response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: testEmail, password: testPassword })
      .expect(HttpStatus.CREATED);
    const authBody = authRes.body as { session: { access_token: string } };
    accessToken = authBody.session.access_token;

    // Crie um jogador
    const playerRes: Response = await request(app.getHttpServer())
      .post('/players')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Stats Player', email: testEmail, level: 1 })
      .expect(HttpStatus.CREATED);
    playerId = (playerRes.body as { id: string }).id;

    // Crie um deck associado ao jogador
    const deckRes: Response = await request(app.getHttpServer())
      .post('/decks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ player_id: playerId, name: 'Stats Deck', archetype: 'Aggro' })
      .expect(HttpStatus.CREATED);
    deckId = (deckRes.body as { id: string }).id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /stats/player/:id - should return player statistics', async () => {
    const response: Response = await request(app.getHttpServer())
      .get(`/stats/player/${playerId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);
    type PlayerStats = {
      playerId: string;
      total: number;
      winRate: number;
      wins: number;
    };
    const responseBody: PlayerStats = response.body as PlayerStats;
    expect(responseBody).toHaveProperty('playerId');
    // Alterado de 'totalMatches' para 'total'
    expect(responseBody).toHaveProperty('total');
    expect(typeof responseBody.total).toBe('number');
    expect(responseBody).toHaveProperty('winRate');
    expect(typeof responseBody.winRate).toBe('number');
    expect(responseBody).toHaveProperty('wins');
    expect(typeof responseBody.wins).toBe('number');
  });

  it('GET /stats/deck/:id - should return deck statistics', async () => {
    const response: Response = await request(app.getHttpServer())
      .get(`/stats/deck/${deckId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);
    type DeckStats = {
      winRate: number;
    };
    const responseBody: DeckStats = response.body as DeckStats;
    // Ajuste: verifica a propriedade "winRate" em vez de "win_rate"
    expect(responseBody).toHaveProperty('winRate');
    expect(typeof responseBody.winRate).toBe('number');
  });

  it('GET /stats/matchup/:player1/:player2 - should return matchup history', async () => {
    const response: Response = await request(app.getHttpServer())
      .get(`/stats/matchup/${playerId}/${playerId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);
    // Ajuste: espera a propriedade "matches" (e não "history")
    type MatchupHistory = { matches: any[]; player1: string; player2: string };
    const responseBody: MatchupHistory = response.body as MatchupHistory;
    expect(responseBody).toHaveProperty('matches');
    expect(Array.isArray(responseBody.matches)).toBe(true);
    expect(response.body).toHaveProperty('player1');
    expect(response.body).toHaveProperty('player2');
  });

  it('GET /stats/decks/:deck1/:deck2 - should compare two decks', async () => {
    const response: Response = await request(app.getHttpServer())
      .get(`/stats/decks/${deckId}/${deckId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);
    // Ajuste: espera as propriedades "deck1" e "deck2" em vez de "comparison"
    expect(response.body).toHaveProperty('deck1');
    expect(response.body).toHaveProperty('deck2');
  });

  it('GET /stats/leaderboard - should return the leaderboard', async () => {
    const response: Response = await request(app.getHttpServer())
      .get('/stats/leaderboard')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
