import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

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
    testEmail = `testuser${Date.now()}@gmail.com`; // Ensures a unique email for each test
    testPassword = 'password123';

    const response = (await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: testEmail, password: testPassword })
      .expect(HttpStatus.CREATED)) as {
      body: { user: { id: string }; session?: any };
    };

    console.log('Signup Response:', response.body);

    expect(response.body).toHaveProperty('user');

    // Simulate email confirmation directly in Supabase
    const userId = (response.body as { user: { id: string } }).user.id;
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true, // Forces email activation
    });

    if (error) {
      console.error('Error confirming email:', error);
      throw new Error('Failed to confirm email before login');
    }
  });

  it('POST /auth/signup - should create a new user and confirm email', async () => {
    testEmail = `testuser${Date.now()}@gmail.com`;
    testPassword = 'password123';

    const response: request.Response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: testEmail, password: testPassword })
      .expect(HttpStatus.CREATED);

    console.log('Signup Response:', response.status, response.body);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('session');

    // **MANUAL EMAIL CONFIRMATION**
    await supabaseAdmin.auth.admin.updateUserById(
      (response.body as { user: { id: string } }).user.id,
      {
        email_confirm: true,
      },
    );

    console.log('Email confirmed for:', testEmail);
  }, 20000); // Increased timeout to 20s
});
