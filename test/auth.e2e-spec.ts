// test/auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

// Interface para a resposta do signup
interface AuthResponse {
  user: { id: string; email?: string };
  session?: { access_token: string; refresh_token?: string };
}

// Supabase Admin API configuration
const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE_KEY = process.env
  .SUPABASE_SERVICE_ROLE_KEY as string;

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log(
  'SUPABASE_SERVICE_ROLE_KEY:',
  process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'NOT SET',
);

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('The SUPABASE_SERVICE_ROLE_KEY variable is not defined.');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let testEmail: string;
  let testPassword: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/signup - should create a new user and confirm email', async () => {
    testEmail = `testuser${Date.now()}@gmail.com`; // Garante um email único para cada teste
    testPassword = 'password123';

    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: testEmail, password: testPassword })
      .expect(HttpStatus.CREATED);

    // Faz o type assertion para a interface definida
    const body = response.body as AuthResponse;
    console.log('Signup Response:', body);

    expect(body).toHaveProperty('user');

    // Simula a confirmação do email diretamente no Supabase
    const userId = body.user.id;
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true, // Força a ativação do email
    });

    if (error) {
      console.error('Error confirming email:', error);
      throw new Error('Failed to confirm email before login');
    }
  }, 20000); // Timeout aumentado para 20s

  it('POST /auth/signup - should create a new user and return session', async () => {
    testEmail = `testuser${Date.now()}@gmail.com`;
    testPassword = 'password123';

    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: testEmail, password: testPassword })
      .expect(HttpStatus.CREATED);

    // Faz o type assertion para a interface
    const body = response.body as AuthResponse;
    console.log('Signup Response:', response.status, body);

    expect(body).toHaveProperty('user');
    expect(body).toHaveProperty('session');

    // Confirma o email manualmente
    await supabaseAdmin.auth.admin.updateUserById(body.user.id, {
      email_confirm: true,
    });

    console.log('Email confirmed for:', testEmail);
  }, 20000);
});
