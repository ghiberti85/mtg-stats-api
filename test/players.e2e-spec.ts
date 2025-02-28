// test/players.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request, { Response } from 'supertest';
import { AppModule } from '../src/app.module';

interface AuthResponse {
  user: { id: string; email: string };
  session: { access_token: string; refresh_token?: string };
}

interface PlayerResponse {
  id: string;
  name: string;
  email: string;
  level: number;
}

describe('PlayersController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let playerId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    // Cria um usuário e obtém o token
    const testEmail = `playertester${Date.now()}@example.com`;
    const testPassword = 'password123';
    const authRes: Response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: testEmail, password: testPassword })
      .expect(HttpStatus.CREATED);
    const authBody = authRes.body as AuthResponse;
    accessToken = authBody.session.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /players - should create a new player', async () => {
    const playerPayload = {
      name: 'Test Player',
      email: `player${Date.now()}@example.com`,
      level: 1,
    };

    const response: Response = await request(app.getHttpServer())
      .post('/players')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(playerPayload)
      .expect(HttpStatus.CREATED);
    const playerBody = response.body as PlayerResponse;
    playerId = playerBody.id;

    expect(playerBody).toHaveProperty('id');
    expect(playerBody.name).toBe(playerPayload.name);
  });

  it('GET /players - should return list of players', async () => {
    const response: Response = await request(app.getHttpServer())
      .get('/players')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);
    const players = response.body as PlayerResponse[];
    expect(Array.isArray(players)).toBe(true);
    expect(players.find((p) => p.id === playerId)).toBeDefined();
  });

  it('GET /players/:id - should return specific player', async () => {
    const response: Response = await request(app.getHttpServer())
      .get(`/players/${playerId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);
    const player = response.body as PlayerResponse;
    expect(player.id).toBe(playerId);
  });

  it('PATCH /players/:id - should update player info', async () => {
    // Removemos o id do payload, pois já estamos passando o id na URL.
    const updatedPayload = { name: 'Updated Player Name' };
    const response: Response = await request(app.getHttpServer())
      .patch(`/players/${playerId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updatedPayload)
      .expect(HttpStatus.OK);
    const player = response.body as PlayerResponse;
    expect(player.name).toBe(updatedPayload.name);
  });

  it('DELETE /players/:id - should delete the player', async () => {
    await request(app.getHttpServer())
      .delete(`/players/${playerId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);
    await request(app.getHttpServer())
      .get(`/players/${playerId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('GET /players/stats/:id - should return player stats or 404 if no stats', async () => {
    await request(app.getHttpServer())
      .get(`/players/stats/${playerId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect((res: Response) => {
        if (res.status === 200) {
          expect(res.body).toHaveProperty('stats');
        }
      });
  });
});
