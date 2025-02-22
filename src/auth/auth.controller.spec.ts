import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { HttpException } from '@nestjs/common';

jest.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    },
  },
}));

import { supabase } from '../supabaseClient';

describe('AuthController', () => {
  let authController: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signUp', () => {
    it('should sign up a user successfully', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: {
          user: { id: 'user123', email: 'test@example.com' },
          session: { access_token: 'token123' },
        },
        error: null,
      });

      const result = await authController.signUp({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.id).toBe('user123');
      expect(result.session?.access_token).toBe('token123');
    });

    it('should throw an HttpException if there is an error', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'User already exists' },
      });

      await expect(
        authController.signUp({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('signIn', () => {
    it('should sign in a user successfully', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: {
          user: { id: 'user123', email: 'test@example.com' },
          session: { access_token: 'token123' },
        },
        error: null,
      });

      const result = await authController.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.id).toBe('user123');
      expect(result.session.access_token).toBe('token123');
    });

    it('should throw an HttpException if login fails', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });

      await expect(
        authController.signIn({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(HttpException);
    });
  });
});
