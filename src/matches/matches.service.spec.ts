import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { UnauthorizedException } from '@nestjs/common';

// ✅ Mock do Supabase corrigido
jest.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(),
      eq: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
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

  it('should throw UnauthorizedException if Authorization header is missing', async () => {
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    };

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      'No token provided',
    );
  });

  it('should throw UnauthorizedException if Authorization header is invalid format', async () => {
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'somethingrandom',
          },
        }),
      }),
    };

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      'Invalid Authorization header format',
    );
  });

  it('should throw UnauthorizedException if token is invalid/expired', async () => {
    // ✅ Corrigido: Mock adequado para erro no `getUser`
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
    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      'Invalid or expired token',
    );
  });

  it('should return true if token is valid', async () => {
    // ✅ Corrigido: Estrutura correta do retorno da API Supabase v2
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user123', email: 'test@example.com' } },
      error: null,
    });

    const mockRequest: {
      headers: { authorization: string };
      user?: { id: string; email: string };
    } = {
      headers: {
        authorization: 'Bearer valid_token',
      },
    };

    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    };

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
    // ✅ Corrigido: Agora o usuário está corretamente anexado ao request
    expect(mockRequest.user).toEqual({
      id: 'user123',
      email: 'test@example.com',
    });
  });
});
