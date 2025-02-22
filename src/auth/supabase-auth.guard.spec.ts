import { SupabaseAuthGuard } from './supabase-auth.guard';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

import { supabase } from '../supabaseClient';

describe('SupabaseAuthGuard', () => {
  let guard: SupabaseAuthGuard;

  beforeEach(() => {
    guard = new SupabaseAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if token is valid', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user123', email: 'test@example.com' } },
      error: null,
    });

    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer valid_token',
          },
        }),
      }),
    };

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if header is missing', async () => {
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    };

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'Invalid or expired token' },
    });

    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer invalid_token',
          },
        }),
      }),
    };

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
