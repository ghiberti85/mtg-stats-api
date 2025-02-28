/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { HttpException } from '@nestjs/common';
import { createResponse } from 'node-mocks-http';
import { Response } from 'express';

jest.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      refreshSession: jest.fn(),
    },
  },
}));

import { supabase } from '../supabaseClient';

// Cria um objeto Response mockado utilizando node-mocks-http
const dummyRes: Response = createResponse() as Response;

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

      const result = await authController.signUp(
        { email: 'test@example.com', password: 'password123' },
        dummyRes,
      );

      expect(result.user.id).toBe('user123');
      expect(result.session?.access_token).toBe('token123');
    });

    it('should throw an HttpException if there is an error', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'User already exists' },
      });

      await expect(
        authController.signUp(
          { email: 'test@example.com', password: 'password123' },
          dummyRes,
        ),
      ).rejects.toThrow(HttpException);
    });

    it('should throw InternalServerErrorException if data.user is null', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      await expect(
        authController.signUp(
          { email: 'test@example.com', password: 'password123' },
          dummyRes,
        ),
      ).rejects.toThrowError('No user returned from Supabase');
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

      const result = await authController.signIn(
        { email: 'test@example.com', password: 'password123' },
        dummyRes,
      );

      expect(result.user.id).toBe('user123');
      expect(result.session.access_token).toBe('token123');
    });

    it('should throw an HttpException if login fails', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });

      await expect(
        authController.signIn(
          { email: 'test@example.com', password: 'wrongpassword' },
          dummyRes,
        ),
      ).rejects.toThrow(HttpException);
    });

    it('should throw InternalServerErrorException if data.user is null', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      await expect(
        authController.signIn(
          { email: 'test@example.com', password: 'test' },
          dummyRes,
        ),
      ).rejects.toThrowError('No user returned from Supabase');
    });

    it('should throw Unknown error if error is not an object with message', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: null,
        error: 'WeirdErrorFormat',
      });

      await expect(
        authController.signIn(
          { email: 'test@example.com', password: 'test' },
          dummyRes,
        ),
      ).rejects.toThrowError('Unknown error occurred');
    });
  });

  describe('signOut', () => {
    it('should sign out a user successfully', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

      const result = await authController.signOut();
      expect(result).toEqual({ message: 'Successfully signed out' });
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should throw an HttpException if signOut returns an error with message', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: { message: 'Signout error' },
      });

      await expect(authController.signOut()).rejects.toThrowError(
        'Signout error',
      );
    });

    it('should throw an HttpException if signOut returns an unknown error', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: 'UnknownErrorFormat',
      });

      await expect(authController.signOut()).rejects.toThrowError(
        'Unknown error occurred',
      );
    });
  });

  describe('refreshToken', () => {
    it('should throw an HttpException if no token is provided', async () => {
      await expect(authController.refreshToken('')).rejects.toThrowError(
        'Refresh token is required',
      );
    });

    it('should refresh token successfully', async () => {
      (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: {
          session: {
            access_token: 'newToken',
            refresh_token: 'newRefreshToken',
          },
        },
        error: null,
      });

      const result = await authController.refreshToken('validRefreshToken');
      expect(result).toEqual({
        accessToken: 'newToken',
        refreshToken: 'newRefreshToken',
      });
    });

    it('should throw HttpException if refreshSession returns an error', async () => {
      (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Invalid refresh token' },
      });

      await expect(
        authController.refreshToken('badToken'),
      ).rejects.toThrowError('Refresh token error: Invalid refresh token');
    });

    it('should throw HttpException if session is null', async () => {
      (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      await expect(
        authController.refreshToken('noSession'),
      ).rejects.toThrowError('No session returned from Supabase');
    });
  });
});
