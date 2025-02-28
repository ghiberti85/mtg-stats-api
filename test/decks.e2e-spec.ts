// test/decks.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('DecksController (e2e)', () => {
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

    // Crie um usuário e obtenha um token (pode aproveitar os testes de Auth)
    const testEmail = `decktester${Date.now()}@example.com`;
    const testPassword = 'password123';
    const authRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: testEmail, password: testPassword })
      .expect(HttpStatus.CREATED);
    const body = authRes.body as { session: { access_token: string } };
    accessToken = body.session.access_token;

    // Crie um jogador para esse usuário
    const playerRes = await request(app.getHttpServer())
      .post('/players')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Deck Tester', email: testEmail, level: 1 })
      .expect(HttpStatus.CREATED);
    const playerBody = playerRes.body as { id: string };
    playerId = playerBody.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /decks - should create a new deck', async () => {
    const deckPayload = {
      player_id: playerId,
      name: 'Test Deck',
      archetype: 'Control',
    };

    const response = await request(app.getHttpServer())
      .post('/decks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(deckPayload)
      .expect(HttpStatus.CREATED);
    deckId = (response.body as { id: string }).id;
    expect(response.body).toHaveProperty('id');
    const responseBody = response.body as { id: string; name: string };
    expect(responseBody.name).toBe(deckPayload.name);
  });

  it('GET /decks - should return list of decks', async () => {
    const response = await request(app.getHttpServer())
      .get('/decks')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);
    expect(Array.isArray(response.body)).toBe(true);
    // Verifica se o deck criado está na lista
    expect(
      (response.body as { id: string }[]).find((d) => d.id === deckId),
    ).toBeDefined();
  });

  it('GET /decks/:id - should return a specific deck', async () => {
    const response = await request(app.getHttpServer())
      .get(`/decks/${deckId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);
    const responseBody = response.body as { id: string };
    expect(responseBody.id).toBe(deckId);
  });

  it('PATCH /decks/:id - should update the deck', async () => {
    const updatedPayload = { name: 'Updated Deck Name' };
    const response = await request(app.getHttpServer())
      .patch(`/decks/${deckId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updatedPayload)
      .expect(HttpStatus.OK);
    const responseBody = response.body as { name: string };
    expect(responseBody.name).toBe(updatedPayload.name);
  });

  it('DELETE /decks/:id - should delete the deck', async () => {
    await request(app.getHttpServer())
      .delete(`/decks/${deckId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);
    await request(app.getHttpServer())
      .get(`/decks/${deckId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});
