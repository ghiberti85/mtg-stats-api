// test/matches.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

interface AuthResponse {
  user: { id: string; email?: string };
  session: { access_token: string };
}

interface PlayerResponse {
  id: string;
  name: string;
  email: string;
  level: number;
}

interface DeckResponse {
  id: string;
  player_id: string;
  name: string;
  archetype: string;
}

interface MatchResponse {
  id: string;
  player_id: string;
  opponent_id: string;
  deck_id: string;
  opponent_deck_id: string;
  format: string;
  duration: number;
  result: 'win' | 'loss' | 'draw';
}

describe('MatchesController (e2e)', () => {
  let app: INestApplication;
  let accessToken1: string;
  let accessToken2: string;
  let playerId1: string;
  let playerId2: string;
  let deckId1: string;
  let deckId2: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    const testPassword = 'password123';

    // --- Cria o primeiro usuário, jogador e deck ---
    const testEmail1 = `matchtester1${Date.now()}@example.com`;
    const authRes1 = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: testEmail1, password: testPassword })
      .expect(HttpStatus.CREATED);
    const body1 = authRes1.body as AuthResponse;
    accessToken1 = body1.session.access_token;

    // Cria um registro de jogador para o primeiro usuário
    const playerRes1 = await request(app.getHttpServer())
      .post('/players')
      .set('Authorization', `Bearer ${accessToken1}`)
      .send({ name: 'Player One', email: testEmail1, level: 1 })
      .expect(HttpStatus.CREATED);
    const playerBody1 = playerRes1.body as PlayerResponse;
    playerId1 = playerBody1.id;

    // Cria um deck para o primeiro jogador (inclui player_id no payload)
    const deckRes1 = await request(app.getHttpServer())
      .post('/decks')
      .set('Authorization', `Bearer ${accessToken1}`)
      .send({ player_id: playerId1, name: 'Deck One', archetype: 'Aggro' })
      .expect(HttpStatus.CREATED);
    const deckBody1 = deckRes1.body as DeckResponse;
    deckId1 = deckBody1.id;

    // --- Cria o segundo usuário, jogador e deck ---
    const testEmail2 = `matchtester2${Date.now()}@example.com`;
    const authRes2 = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: testEmail2, password: testPassword })
      .expect(HttpStatus.CREATED);
    const body2 = authRes2.body as AuthResponse;
    accessToken2 = body2.session.access_token;

    // Cria um registro de jogador para o segundo usuário
    const playerRes2 = await request(app.getHttpServer())
      .post('/players')
      .set('Authorization', `Bearer ${accessToken2}`)
      .send({ name: 'Player Two', email: testEmail2, level: 1 })
      .expect(HttpStatus.CREATED);
    const playerBody2 = playerRes2.body as PlayerResponse;
    playerId2 = playerBody2.id;

    // Cria um deck para o segundo jogador (inclui player_id)
    const deckRes2 = await request(app.getHttpServer())
      .post('/decks')
      .set('Authorization', `Bearer ${accessToken2}`)
      .send({ player_id: playerId2, name: 'Deck Two', archetype: 'Control' })
      .expect(HttpStatus.CREATED);
    const deckBody2 = deckRes2.body as DeckResponse;
    deckId2 = deckBody2.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /matches - should create a new match with normalized result', async () => {
    const matchPayload = {
      player_id: playerId1,
      opponent_id: playerId2,
      deck_id: deckId1,
      opponent_deck_id: deckId2,
      format: 'STANDARD',
      duration: 30,
      result: 'win', // valor em minúsculas conforme definido no enum
    };

    const response = await request(app.getHttpServer())
      .post('/matches')
      .set('Authorization', `Bearer ${accessToken1}`)
      .send(matchPayload)
      .expect(HttpStatus.CREATED);

    const body = response.body as MatchResponse;
    expect(body.result).toBe('win');
    expect(body.player_id).toBe(playerId1);
    expect(body.opponent_id).toBe(playerId2);
  });
});
